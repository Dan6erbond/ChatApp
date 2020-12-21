import jwt from "jsonwebtoken";

class JwtManager {
  constructor(jwtKey) {
    this.jwtKey = jwtKey;
  }

  signUser = ({ id, username }) => {
    return jwt.sign({ id, username }, this.jwtKey, {
      expiresIn: 60 * 60 * 60 * 24 * 365,
    });
  };

  verifyUser = (token) => {
    try {
      return jwt.verify(token, this.jwtKey);
    } catch (e) {
      console.log("e:", e);
      return null;
    }
  };
}

export default JwtManager;
