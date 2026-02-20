import SwiftUI

// MARK: - DeepLinkRoute

enum DeepLinkRoute: Equatable {
    case offer(id: Int)
    case merchant(id: Int)
    case subscription
    case claimGift(token: String)
    case referral(code: String)
    case resetPassword(token: String)
    case verifyEmail(token: String)
}

// MARK: - DeepLinkHandler

@MainActor
final class DeepLinkHandler: ObservableObject {
    static let shared = DeepLinkHandler()
    @Published var pendingRoute: DeepLinkRoute?

    private init() {}

    func handle(url: URL) {
        guard let route = parse(url: url) else { return }
        pendingRoute = route
    }

    private func parse(url: URL) -> DeepLinkRoute? {
        // Support both campcard:// scheme and https://campcardapp.org/app/...
        let host = url.host ?? ""
        let path = url.path
        let query = queryParams(from: url)

        // Universal links: https://campcardapp.org/app/offers/123
        if host.contains("campcardapp.org") {
            return parseWebPath(path: path, query: query)
        }

        // Custom scheme: campcard://offers/123
        if url.scheme == "campcard" {
            return parseCustomScheme(host: host, path: path, query: query)
        }
        return nil
    }

    private func parseWebPath(path: String, query: [String: String]) -> DeepLinkRoute? {
        let parts = path.split(separator: "/").map(String.init)
        guard parts.count >= 2, parts[0] == "app" else { return nil }

        switch parts[1] {
        case "offers" where parts.count >= 3:
            if let id = Int(parts[2]) { return .offer(id: id) }
        case "merchants" where parts.count >= 3:
            if let id = Int(parts[2]) { return .merchant(id: id) }
        case "subscription":
            return .subscription
        case "claim" where parts.count >= 3:
            return .claimGift(token: parts[2])
        case "referral" where parts.count >= 3:
            return .referral(code: parts[2])
        case "reset-password":
            if let token = query["token"] { return .resetPassword(token: token) }
        case "verify-email":
            if let token = query["token"] { return .verifyEmail(token: token) }
        default: break
        }
        return nil
    }

    private func parseCustomScheme(host: String, path: String, query: [String: String]) -> DeepLinkRoute? {
        // campcard://offers/123 → host="offers", path="/123"
        let idStr = path.trimmingCharacters(in: CharacterSet(charactersIn: "/"))

        switch host {
        case "offers":
            if let id = Int(idStr) { return .offer(id: id) }
        case "merchants":
            if let id = Int(idStr) { return .merchant(id: id) }
        case "subscription":
            return .subscription
        case "claim":
            if !idStr.isEmpty { return .claimGift(token: idStr) }
        case "referral":
            if !idStr.isEmpty { return .referral(code: idStr) }
        case "reset-password":
            if let token = query["token"] { return .resetPassword(token: token) }
        case "verify-email":
            if let token = query["token"] { return .verifyEmail(token: token) }
        default: break
        }
        return nil
    }

    private func queryParams(from url: URL) -> [String: String] {
        var params: [String: String] = [:]
        URLComponents(url: url, resolvingAgainstBaseURL: false)?
            .queryItems?
            .forEach { params[$0.name] = $0.value }
        return params
    }
}
