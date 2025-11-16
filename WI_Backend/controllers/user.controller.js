// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// const handleGetUser = async (req, res) => {
//     const { user } = req;

//     user.password = undefined;
//     user.createdAt = undefined;
//     user.updatedAt = undefined;

//     res.status(200).json({
//         success: true,
//         message: "User found successfully",
//         data: { user }
//     });
// }

// const handleUpdateUser = async (req, res) => {
//     const { userId } = req.body;

//     try {
//         const updatedUser = await prisma.user.update({
//             where: {
//                 userId: userId,
//             },
//             data: {
//                 ...req.body,
//             },
//             select: {
//                 userId: true,
//                 email: true,
//                 phoneNumber: true,
//                 username: true,
//                 firstname: true,
//                 lastname: true,
//             }
//         });

//         res.status(200).json({
//             success: true,
//             message: "User updated successfully",
//             data: { user: updatedUser }
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// }

// export {
//     handleGetUser,
//     handleUpdateUser,
// };

import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

const handleGetUser = async (req, res) => {
  try{
  const {user} = req;

    user.password = undefined;
    user.createdAt = undefined;
    user.updatedAt = undefined;

    res.status(200).json({
        message: "User found",
        user
    });
  }catch(e){
console.log(e);
        res.status(500).json({
            message: `Something went wrong in getting user ${e.message}`,
            status: false,
        });
  }
}

const handleUpdateUser = async (req, res) => {
    const {userId} = req.body;

    try {
        const updatedUser = await prisma.user.update({
            where: {
                userId: userId,
            },
            data: {
                ...req.body,
            },
            select: {
                userId: true,
                email: true,
                phoneNumber: true,
                username: true,
                firstname: true,
                lastname: true,
            }
        });

        res.status(200).json({
            message: "User updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: `Something went wrong in sign up ${error.message}`,
            status: false,
        });
    }
}

export {
    handleGetUser,
    handleUpdateUser,
}