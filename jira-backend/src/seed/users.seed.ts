import prismaClient from "../configs/prismaClient.config";
import bcrypt from "bcrypt";

const users = [
  {
    name: "Arpit Kumar",
    email: "arpitkumar4000@gmail.com",
    password: "12345",
  },
];

export const seedUsers = () => {
  users.map(async (user) => {
    const isUserExists = await prismaClient.users.findUnique({
      where: {
        email: user.email,
      },
    });
    if (isUserExists) {
      console.log(`User ${user.email} already exists`);
      return;
    }

    const encryptedPassword = await bcrypt.hash(user.password, 10);
    const userCreated = await prismaClient.users.create({
      data: {
        name: user.name,
        email: user.email,
        password: encryptedPassword,
        roles: {
          create: {
            role: {
              connect: {
                name: "admin",
              },
            },
            assigned_by: "Automated",
          },
        },
      },
    });

    console.log(
      `User ${userCreated.name} created with email ${userCreated.email}`
    );
  });
};
