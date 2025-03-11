const NotificationPanel = ({ notifications, onMarkAsRead }) => {
  return (
    <div className="bg-gray-800 bg-opacity-80 backdrop-blur-md shadow-xl rounded-2xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-white">Recent Messages</h2>
        <Link href="/student/auth/message">
          <div className="text-purple-400 hover:text-purple-300 transition-colors flex items-center">
            <MessageSquare size={16} className="mr-1" />
            <span>Open Chat</span>
          </div>
        </Link>
      </div>

      <div className="overflow-y-auto max-h-96 custom-scrollbar mt-4">
        {notifications.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            No new messages. All caught up!
          </p>
        ) : (
          <ul className="space-y-3">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`flex items-center bg-gray-700 p-4 rounded-lg transition-colors ${
                  !notification.read ? "border-l-4 border-l-purple-600" : ""
                }`}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="relative">
                    <Image
                      src={notification.tutorProfile || "/default-profile.jpg"}
                      alt={notification.tutorName}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover border-2 border-purple-500"
                    />
                    {!notification.read && (
                      <div className="absolute -top-1 -right-1 bg-purple-600 rounded-full p-0.5">
                        <Bell size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-semibold text-white">
                        {notification.tutorName}
                      </h3>
                      <span className="text-xs text-gray-400">
                        {new Date(notification.timestamp).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1">
                      {notification.message}
                    </p>
                  </div>
                </div>
                {!notification.read && (
                  <button
                    onClick={() => onMarkAsRead(notification.id)}
                    className="text-purple-400 hover:text-purple-300 ml-2 text-sm"
                  >
                    Mark as read
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
