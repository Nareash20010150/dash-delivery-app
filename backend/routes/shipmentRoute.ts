import express, { Router, Request, Response } from "express";
import { GetUserAuthInfoRequest, ShipmentAttributes } from "../types";
import Shipment from "../database/models/shipment";
import User from "../database/models/user";

const router: Router = express.Router();
const authorization = require("../middleware/authorization");

router.get(
  "/all",
  authorization,
  async (req: GetUserAuthInfoRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(403).send({
          error: "User not authenticated",
        });
      }
      const shipmentList: Shipment[] = await Shipment.findAll({
        include: { model: User, as: "user", attributes: ["name", "address"] },
      });
      return res.status(200).send(shipmentList);
    } catch (error) {
      return res.status(500).send(error);
    }
  }
);

router.get("/:id", async (req: GetUserAuthInfoRequest, res: Response) => {
  try {
    const id: string = req.params.id;
    const shipment: Shipment | null = await Shipment.findByPk(id);
    if (!shipment) {
      return res.status(400).send({
        message: "Track ID does not exists",
      });
    }
    await Shipment.findOne({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["address"],
        },
      ],
      where: {
        id: id,
      },
      attributes: [
        "id",
        "recipientAddress",
        "packageDescription",
        "packageWeight",
        "shipmentStatus",
      ],
    }).then((shipment) => {
      return res.status(200).send(shipment);
    });
  } catch (error) {
    return res.status(500).send({
      message: "Invalid tracking ID",
    });
  }
});

router.post(
  "/",
  authorization,
  async (req: GetUserAuthInfoRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(403).send({
          error: "User not authenticated",
        });
      }
      const shipmentAttributes: ShipmentAttributes = req.body;
      await Shipment.create(shipmentAttributes)
        .then((shipment) => {
          // Create JWT access token
          return res.status(202).send(shipment);
        })
        .catch((error) => {
          return res.status(400).send(error);
        });
    } catch (error) {
      return res.status(500).send(error);
    }
  }
);

router.delete(
  "/:id",
  authorization,
  async (req: GetUserAuthInfoRequest, res: Response) => {
    try {
      const id: string = req.params.id;
      if (!req.user) {
        return res.status(403).send({
          error: "User not authenticated",
        });
      }
      const shipment: Shipment | null = await Shipment.findByPk(id);
      if (!shipment) {
        return res.status(401).send({
          message: "The shipment does not exists",
        });
      }
      await Shipment.destroy({
        where: {
          id: id,
        },
      }).then(() => {
        return res.status(200).send();
      });
    } catch (error) {
      return res.status(500).send(error);
    }
  }
);

router.put(
  "/:id",
  authorization,
  async (req: GetUserAuthInfoRequest, res: Response) => {
    try {
      const id: string = req.params.id;
      const shipmentAttributes: ShipmentAttributes = req.body;
      if (!req.user) {
        return res.status(403).send({
          error: "User not authenticated",
        });
      }
      const shipment: Shipment | null = await Shipment.findByPk(id);
      if (!shipment) {
        return res.status(401).send({
          message: "The shipment does not exists",
        });
      }
      await Shipment.update(shipmentAttributes, {
        where: {
          id: id,
        },
      }).then(async () => {
        const shipment = await Shipment.findByPk(id, {
          include: { model: User, as: "user", attributes: ["name", "address"] },
        });
        return res.status(200).send(shipment);
      });
    } catch (error) {
      return res.status(500).send(error);
    }
  }
);

router.get(
  "/user/:id",
  authorization,
  async (req: GetUserAuthInfoRequest, res: Response) => {
    try {
      const id: number = parseInt(req.params.id);
      if (!req.user) {
        return res.status(403).send({
          error: "User not authenticated",
        });
      }
      const user: User | null = await User.findByPk(id);
      if (!user) {
        return res.status(401).send({
          message: "The user does not exists",
        });
      }
      const shipmentList: Shipment[] = await Shipment.findAll({
        where: {
          userId: id,
        },
      });
      res.status(200).send(shipmentList);
    } catch (error) {
      return res.status(500).send(error);
    }
  }
);

export default router;
