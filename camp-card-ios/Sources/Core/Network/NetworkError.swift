import Foundation

enum NetworkError: LocalizedError {
    case invalidURL
    case noData
    case decodingFailed(Error)
    case serverError(Int, String)
    case unauthorized
    case forbidden
    case notFound
    case timeout
    case noConnection
    case unknown(Error)
    case custom(String)

    var errorDescription: String? {
        switch self {
        case .invalidURL: return "Invalid URL"
        case .noData: return "No data received"
        case .decodingFailed(let e): return "Failed to parse response: \(e.localizedDescription)"
        case .serverError(_, let msg): return msg
        case .unauthorized: return "Authentication required. Please log in again."
        case .forbidden: return "You don't have permission to do that."
        case .notFound: return "The requested resource was not found."
        case .timeout: return "The request timed out. Please try again."
        case .noConnection: return "No internet connection."
        case .unknown(let e): return e.localizedDescription
        case .custom(let msg): return msg
        }
    }
}
