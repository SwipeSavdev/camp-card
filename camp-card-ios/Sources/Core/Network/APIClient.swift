import Foundation

actor APIClient {
    static let shared = APIClient()
    private let session: URLSession
    private let decoder: JSONDecoder
    private let encoder: JSONEncoder
    // Serialize concurrent 401 refresh attempts
    private var isRefreshing = false
    private var refreshContinuations: [CheckedContinuation<String, Error>] = []

    private init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 60
        session = URLSession(configuration: config)
        decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
    }

    // MARK: - Main Request
    func request<T: Decodable>(_ endpoint: Endpoint) async throws -> T {
        guard let url = endpoint.url else { throw NetworkError.invalidURL }
        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = endpoint.method.rawValue
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        urlRequest.setValue("application/json", forHTTPHeaderField: "Accept")

        if let body = endpoint.body {
            urlRequest.httpBody = try encoder.encode(AnyEncodable2(body))
        }

        if endpoint.requiresAuth {
            let token = try await getValidAccessToken()
            urlRequest.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        return try await executeRequest(urlRequest, endpoint: endpoint)
    }

    // MARK: - Void response
    func requestVoid(_ endpoint: Endpoint) async throws {
        let _: EmptyResponse = try await request(endpoint)
    }

    // MARK: - Execute
    private func executeRequest<T: Decodable>(_ request: URLRequest, endpoint: Endpoint) async throws -> T {
        let (data, response) = try await performRequest(request)
        guard let http = response as? HTTPURLResponse else { throw NetworkError.noData }

        switch http.statusCode {
        case 200...299:
            if T.self == EmptyResponse.self {
                return EmptyResponse() as! T
            }
            do {
                return try decoder.decode(T.self, from: data)
            } catch {
                throw NetworkError.decodingFailed(error)
            }
        case 401:
            // Attempt refresh once for authenticated endpoints
            if endpoint.requiresAuth {
                let newToken = try await refreshTokens()
                var retried = request
                retried.setValue("Bearer \(newToken)", forHTTPHeaderField: "Authorization")
                let (data2, response2) = try await performRequest(retried)
                guard let http2 = response2 as? HTTPURLResponse, (200...299).contains(http2.statusCode) else {
                    throw NetworkError.unauthorized
                }
                if T.self == EmptyResponse.self { return EmptyResponse() as! T }
                return try decoder.decode(T.self, from: data2)
            }
            // Non-auth endpoint (e.g. login) — surface the server's error message
            let serverMsg = (try? decoder.decode(APIError.self, from: data))?.errorDescription
            throw NetworkError.serverError(401, serverMsg ?? "Invalid credentials")
        case 403: throw NetworkError.forbidden
        case 404: throw NetworkError.notFound
        default:
            let message = (try? decoder.decode(APIError.self, from: data))?.message ?? "Unknown error"
            throw NetworkError.serverError(http.statusCode, message)
        }
    }

    private func performRequest(_ request: URLRequest) async throws -> (Data, URLResponse) {
        do {
            return try await session.data(for: request)
        } catch let urlError as URLError {
            switch urlError.code {
            case .timedOut: throw NetworkError.timeout
            case .notConnectedToInternet, .networkConnectionLost: throw NetworkError.noConnection
            default: throw NetworkError.unknown(urlError)
            }
        }
    }

    // MARK: - Token Refresh
    private func getValidAccessToken() async throws -> String {
        if let token = KeychainService.shared.accessToken { return token }
        throw NetworkError.unauthorized
    }

    private func refreshTokens() async throws -> String {
        // Queue concurrent refresh requests
        if isRefreshing {
            return try await withCheckedThrowingContinuation { cont in
                refreshContinuations.append(cont)
            }
        }
        isRefreshing = true
        defer { isRefreshing = false }

        guard let refreshToken = KeychainService.shared.refreshToken else {
            // Wake everyone with failure
            let error = NetworkError.unauthorized
            refreshContinuations.forEach { $0.resume(throwing: error) }
            refreshContinuations.removeAll()
            throw error
        }

        do {
            var req = URLRequest(url: URL(string: APIConstants.baseURL + "/auth/refresh")!)
            req.httpMethod = "POST"
            req.setValue("application/json", forHTTPHeaderField: "Content-Type")
            req.httpBody = try encoder.encode(RefreshTokenRequest(refreshToken: refreshToken))
            let (data, _) = try await session.data(for: req)
            let authResp = try decoder.decode(AuthResponse.self, from: data)
            KeychainService.shared.storeAuthTokens(access: authResp.accessToken, refresh: authResp.refreshToken)
            let token = authResp.accessToken
            refreshContinuations.forEach { $0.resume(returning: token) }
            refreshContinuations.removeAll()
            return token
        } catch {
            // Logout on refresh failure
            await MainActor.run { AuthViewModel.shared.logout() }
            refreshContinuations.forEach { $0.resume(throwing: NetworkError.unauthorized) }
            refreshContinuations.removeAll()
            throw NetworkError.unauthorized
        }
    }
}

// MARK: - Helpers
struct EmptyResponse: Codable {}

private struct AnyEncodable2: Encodable {
    private let value: Encodable
    init(_ value: Encodable) { self.value = value }
    func encode(to encoder: Encoder) throws { try value.encode(to: encoder) }
}
