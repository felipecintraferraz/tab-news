/* eslint-disable no-unsafe-finally */
import user from "models/user.js";
import passwordUtil from "infra/password.js";
import {
  UnauthorizedError,
  BadRequestError,
  NotFoundError,
} from "infra/errors.js";

async function getAuthenticatedUser(email, password) {
  if (!email || !password) {
    throw new BadRequestError({
      message: "Email and password are required.",
      action: "Provide both email and password.",
      name: "BadRequestError",
    });
  }
  let storedUser;
  let isPasswordValid;
  try {
    storedUser = await user.findOneBy("email", email);
    isPasswordValid = await passwordUtil.compare(
      password,
      storedUser?.password,
    );
  } catch (error) {
    if (error instanceof NotFoundError) {
      isPasswordValid = false;
    } else {
      throw error;
    }
  } finally {
    if (!isPasswordValid || !storedUser) {
      // eslint-disable-next-line no-unsafe-finally
      throw new UnauthorizedError({
        message: "Unauthorized.",
        action: "Check the credentials.",
        name: "UnauthorizedError",
      });
    } else {
      return storedUser;
    }
  }
}

const authentication = {
  getAuthenticatedUser,
};

export default authentication;
