function parseTokenFromUrl() {
  const hash = window.location.hash.substr(1);
  const params = new URLSearchParams(hash);
  const idToken = params.get("id_token");

  if (idToken) {
    localStorage.setItem("idToken", idToken);
    // Clean the URL
    window.history.replaceState(null, "", window.location.pathname);
  }
}

function requireLogin() {
  parseTokenFromUrl();
  const token = localStorage.getItem("idToken");

  if (!token) {
    // Redirect to Cognito Hosted UI for login
    window.location.href = "https://ap-southeast-2vbh9yejbl.auth.ap-southeast-2.amazoncognito.com/login?client_id=6s2r7m3sr0i0m35n9lqaf7ne2l&response_type=code&scope=email+openid+phone&redirect_uri=https%3A%2F%2Fd84l1y8p4kdic.cloudfront.net";
  }
}
