import { Router } from "express";
import pool from "../db.js";


const router = Router();

router.post("/", async (req, res) => {
  const { order_id, amount } = req.body;

  if (!order_id || !amount) {
    return res.status(400).json({ message: "Hammasini to'ldiring" });
  }

  const { rows } = await pool.query(
    "INSERT INTO payments(order_id, amount, created_at) VALUES($1,$2,CURRENT_DATE) RETURNING *",
    [order_id, amount]
  );

  res.status(201).json(rows[0]);
});

router.get("/", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM payments");
  res.status(200).json(rows);
});

export default router;
