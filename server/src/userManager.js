class UserManager {
  onlineUsers = [];

  userOnline = (user) => {
    this.onlineUsers.push(user);
  };

  userOffline = (user) => {
    this.onlineUsers = this.onlineUsers.filter((u) => u.id !== user.id);
  };
}

export default UserManager;
