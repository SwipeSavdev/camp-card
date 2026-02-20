import SwiftUI

// MARK: - ViewModel

@MainActor
final class NotificationsViewModel: ObservableObject {
    @Published var notifications: [AppNotification] = []
    @Published var isLoading = false
    @Published var isMarkingAll = false
    @Published var error: String?

    private let api = APIClient.shared

    var unread: [AppNotification] {
        notifications.filter { !$0.isRead }
    }

    var read: [AppNotification] {
        notifications.filter { $0.isRead }
    }

    var unreadCount: Int { unread.count }

    func load() async {
        isLoading = true
        error = nil
        do {
            let page: Page<AppNotification> = try await api.request(.notifications(page: 0))
            notifications = page.content
        } catch {
            self.error = (error as? NetworkError)?.errorDescription ?? error.localizedDescription
        }
        isLoading = false
    }

    func markRead(id: Int) async {
        do {
            try await api.requestVoid(.markRead(id: id))
            if let index = notifications.firstIndex(where: { $0.id == id }) {
                // Reconstruct with isRead = true (struct is immutable)
                let old = notifications[index]
                notifications[index] = AppNotification(
                    id: old.id,
                    title: old.title,
                    body: old.body,
                    type: old.type,
                    isRead: true,
                    createdAt: old.createdAt,
                    data: old.data
                )
            }
        } catch {
            // Silently fail - the notification will remain unread
        }
    }

    func markAllRead() async {
        isMarkingAll = true
        do {
            try await api.requestVoid(.markAllRead)
            notifications = notifications.map { old in
                AppNotification(
                    id: old.id,
                    title: old.title,
                    body: old.body,
                    type: old.type,
                    isRead: true,
                    createdAt: old.createdAt,
                    data: old.data
                )
            }
        } catch {
            self.error = (error as? NetworkError)?.errorDescription ?? error.localizedDescription
        }
        isMarkingAll = false
    }
}

// MARK: - NotificationsView

struct NotificationsView: View {
    @StateObject private var vm = NotificationsViewModel()

    var body: some View {
        Group {
            if vm.isLoading {
                SkeletonList(count: 6) { SkeletonNotificationRow() }
            } else if let error = vm.error {
                errorView(message: error)
            } else if vm.notifications.isEmpty {
                emptyView
            } else {
                notificationsList
            }
        }
        .navigationTitle("Notifications")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            if vm.unreadCount > 0 {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        Task { await vm.markAllRead() }
                    } label: {
                        if vm.isMarkingAll {
                            ProgressView()
                                .scaleEffect(0.8)
                        } else {
                            Text("Mark All Read")
                                .font(.subheadline)
                                .foregroundColor(CCColor.primary)
                        }
                    }
                    .disabled(vm.isMarkingAll)
                    .accessibilityLabel("Mark all notifications as read")
                }
            }
        }
        .task { await vm.load() }
    }

    // MARK: - Subviews

    private var notificationsList: some View {
        List {
            // Unread section
            if !vm.unread.isEmpty {
                Section {
                    ForEach(vm.unread) { notification in
                        NotificationRow(notification: notification, isUnread: true)
                            .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                                Button {
                                    Task { await vm.markRead(id: notification.id) }
                                } label: {
                                    Label("Mark Read", systemImage: "checkmark.circle")
                                }
                                .tint(Color(hex: "#003F87"))
                            }
                            .accessibilityLabel(rowAccessibilityLabel(notification, isUnread: true))
                    }
                } header: {
                    HStack {
                        Text("Unread")
                            .font(.subheadline)
                            .fontWeight(.semibold)
                            .foregroundColor(.primary)
                        Spacer()
                        Text("\(vm.unreadCount)")
                            .font(.caption)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(CCColor.primary)
                            .cornerRadius(10)
                    }
                }
            }

            // Read section
            if !vm.read.isEmpty {
                Section {
                    ForEach(vm.read) { notification in
                        NotificationRow(notification: notification, isUnread: false)
                            .accessibilityLabel(rowAccessibilityLabel(notification, isUnread: false))
                    }
                } header: {
                    Text("Read")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .foregroundColor(.primary)
                }
            }
        }
        .listStyle(.insetGrouped)
        .refreshable { await vm.load() }
    }

    private func rowAccessibilityLabel(_ notification: AppNotification, isUnread: Bool) -> String {
        let status = isUnread ? "Unread. " : ""
        return "\(status)\(notification.title). \(notification.body)"
    }

    private func errorView(message: String) -> some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle")
                .font(.largeTitle)
                .foregroundColor(.secondary)
            Text(message)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
            Button("Try Again") {
                Task { await vm.load() }
            }
            .buttonStyle(.borderedProminent)
            .tint(CCColor.primary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private var emptyView: some View {
        VStack(spacing: 16) {
            Image(systemName: "bell.slash")
                .font(.system(size: 48))
                .foregroundColor(.secondary)
            Text("No notifications yet")
                .font(.headline)
            Text("You're all caught up!")
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

// MARK: - NotificationRow

struct NotificationRow: View {
    let notification: AppNotification
    let isUnread: Bool

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            // Unread indicator dot
            Circle()
                .frame(width: 9, height: 9)
                .foregroundColor(isUnread ? CCColor.primary : Color.clear)
                .padding(.top, 5)
                .accessibilityHidden(true)

            VStack(alignment: .leading, spacing: 5) {
                HStack {
                    Text(notification.title)
                        .font(.subheadline)
                        .fontWeight(isUnread ? .semibold : .regular)
                        .foregroundColor(.primary)
                        .lineLimit(1)
                    Spacer()
                    Text(relativeTime(from: notification.createdAt))
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }

                Text(notification.body)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .lineLimit(3)
                    .fixedSize(horizontal: false, vertical: true)

                if let type = notification.type, !type.isEmpty {
                    NotificationTypeBadge(type: type)
                }
            }
        }
        .padding(.vertical, 4)
        .listRowBackground(
            isUnread ? CCColor.primary.opacity(0.04) : CCColor.card
        )
    }

    private func relativeTime(from dateString: String) -> String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        var date = formatter.date(from: dateString)
        if date == nil {
            formatter.formatOptions = [.withInternetDateTime]
            date = formatter.date(from: dateString)
        }
        guard let date else { return dateString }

        let diff = Date().timeIntervalSince(date)
        if diff < 60 { return "now" }
        if diff < 3600 { return "\(Int(diff / 60))m ago" }
        if diff < 86400 { return "\(Int(diff / 3600))h ago" }
        if diff < 604800 { return "\(Int(diff / 86400))d ago" }
        let df = DateFormatter()
        df.dateStyle = .short
        return df.string(from: date)
    }
}

// MARK: - NotificationTypeBadge

struct NotificationTypeBadge: View {
    let type: String

    private var badgeColor: Color {
        switch type.uppercased() {
        case "OFFER": return CCColor.primary
        case "SUBSCRIPTION": return Color(hex: "#003F87")
        case "PAYMENT": return .green
        case "SYSTEM": return .orange
        case "SCOUT", "TROOP": return .purple
        default: return .secondary
        }
    }

    private var badgeLabel: String {
        type.replacingOccurrences(of: "_", with: " ").capitalized
    }

    var body: some View {
        Text(badgeLabel)
            .font(.caption2)
            .fontWeight(.medium)
            .foregroundColor(badgeColor)
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(badgeColor.opacity(0.12))
            .cornerRadius(10)
            .accessibilityLabel("\(badgeLabel) notification")
    }
}
