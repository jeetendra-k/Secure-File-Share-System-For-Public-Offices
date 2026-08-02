type User = {
  employee_id: string;
  role: string;
  department: string;
};

class AuthStore {
  user: User | null = null;
  token: string | null = null;

  login(token: string, user: User) {
    this.token = token;
    this.user = user;

    sessionStorage.setItem("token", token);
    sessionStorage.setItem("user", JSON.stringify(user));
  }

  load() {
    const token = sessionStorage.getItem("token");
    const user = sessionStorage.getItem("user");

    if (token && user) {
      this.token = token;
      this.user = JSON.parse(user);
    }
  }

  logout() {
    this.token = null;
    this.user = null;
    sessionStorage.clear();
    window.location.href = "/login";
  }

  isAuthenticated() {
    return !!this.token;
  }
}

export const authStore = new AuthStore();
