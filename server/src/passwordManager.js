import bcrypt from "bcrypt";

class PasswordManager {
  comparePassword = async (input, password) => {
    return await bcrypt.compare(input, password);
  };

  hashPassowrd = async (password) => {
    return await bcrypt.hash(password, 10);
  };
}

export default PasswordManager;
