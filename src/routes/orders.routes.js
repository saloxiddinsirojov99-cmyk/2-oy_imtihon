import { Router } from "express";
import pool from "../db.js";


const router = Router();

router.post("/", async (req, res) => {
  const { month_count, start_date, end_date, customer_id, car_id } = req.body;

  if (!month_count || !start_date || !end_date || !customer_id || !car_id) {
    return res.status(400).json({ message: "Hammasini to'ldiring" });
  }

  const { rows } = await pool.query(
    `INSERT INTO orders(month_count, start_date, end_date, customer_id, car_id)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [month_count, start_date, end_date, customer_id, car_id]
  );

  res.status(201).json(rows[0]);
});

router.get("/", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM orders");
  res.status(200).json(rows);
});

router.get("/expired", async (req, res) => {
  const query = `
    SELECT 
      c.full_name,
      car.name AS car_name,
      o.month_count,
      car.price,
      CASE
        WHEN o.month_count = 1 THEN 0.15
        WHEN o.month_count = 3 THEN 0.30
        WHEN o.month_count = 6 THEN 0.55
      END AS percent
    FROM orders o
    JOIN customers c ON c.id = o.customer_id
    JOIN cars car ON car.id = o.car_id
    WHERE o.end_date < CURRENT_DATE
  `;

  const { rows } = await pool.query(query);

  const result = rows.map(r => {
    const base = r.price * 0.8;
    const total = base + base * r.percent;

    return {
      full_name: r.full_name,
      car_name: r.car_name,
      month_count: r.month_count,
      monthly_payment: Math.round(total / r.month_count),
      total_debt: Math.round(total)
    };
  });

  res.status(200).json(result);
});

export default router;
