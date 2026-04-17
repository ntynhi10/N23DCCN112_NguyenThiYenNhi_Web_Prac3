const express = require('express');
const cors = require('cors');
const app = express();
const fs = require('fs').promises;
const PATH = './data.json';

async function readData() {
  const raw = await fs.readFile(PATH, 'utf-8');
  return JSON.parse(raw);
}

async function writeData(data) {
  await fs.writeFile(PATH, JSON.stringify(data, null, 2));
}
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await readData();
    res.json(products);
  } catch {
    res.status(500).json({ error: 'Lỗi đọc file' });
  }
});

app.post('/api/products', async(req, res) => {
  try {
    const { name, price } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Thiếu dữ liệu' });
    }

    const products = await readData();

    const newProduct = {
      id: Date.now(),
      name,
      price: Number(price)
    };

    products.push(newProduct);

    await writeData(products);

    res.status(201).json(newProduct);
  } catch {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

app.listen(5000, () =>
  console.log('Backend chạy tại port :5000')
);

app.delete('/api/products/:id', async(req, res) => {
  try {
    const id = Number(req.params.id);
    const products = await readData();

    const newProducts = products.filter(p => p.id !== id);

    if (products.length === newProducts.length) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    }

    await writeData(newProducts);

    res.json({ message: 'Đã xoá thành công' });
  } catch {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

app.put('/api/products/:id', async(req, res) => {
  try {
    const id = Number(req.params.id);
    const products = await readData();

    const index = products.findIndex(p => p.id === id);

    if (index === -1)
      return res.status(404).json({ error: 'Không tìm thấy' });

    products[index] = { ...products[index], ...req.body };

    await writeData(products);

    res.json(products[index]);
  } catch {
    res.status(500).json({ error: 'Lỗi server' });
  }
});