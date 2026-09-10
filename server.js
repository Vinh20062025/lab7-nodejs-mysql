const http = require("http");
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const querystring = require("querystring");
const db = require("./config/db");

const PORT = 3000;

const server = http.createServer((req, res) => {
  // XÓA BÀI VIẾT
  if (req.url.startsWith("/delete") && req.method === "GET") {
    const myURL = new URL(req.url, `http://localhost:${PORT}`);
    const id = myURL.searchParams.get("id");

    db.query("DELETE FROM posts WHERE id = ?", [id])
      .then(() => {
        res.writeHead(302, { Location: "/news" });
        res.end();
      })
      .catch((err) => {
        console.error(err);
        res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
        res.end("<h1>Lỗi khi xóa bài viết</h1>");
      });

    return;
  }

  let filePath = "";

  if (req.url === "/") {
    filePath = path.join(__dirname, "views", "home.html");
  } else if (req.url === "/about") {
    filePath = path.join(__dirname, "views", "about.html");
  } else if (req.url.startsWith("/news")) {
    filePath = path.join(__dirname, "views", "news.ejs");
  } else if (req.url.startsWith("/search")) {
    filePath = path.join(__dirname, "views", "search.ejs");
  } else if (req.url === "/login") {
    filePath = path.join(__dirname, "views", "login.ejs");
  } else if (req.url === "/create") {
    filePath = path.join(__dirname, "views", "create.ejs");
  } else if (req.url.startsWith("/edit")) {
    filePath = path.join(__dirname, "views", "edit.ejs");
  } else {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<h1>404 - Không tìm thấy trang</h1>");
    return;
  }

  fs.readFile(filePath, "utf8", async (err, data) => {
    if (err) {
      console.error(err);
      res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
      res.end("<h1>Lỗi server</h1>");
      return;
    }

    try {
      // THÊM BÀI VIẾT
      if (req.url === "/create" && req.method === "POST") {
        let body = "";

        req.on("data", chunk => {
          body += chunk.toString();
        });

        req.on("end", async () => {
          try {
            const formData = querystring.parse(body);

            await db.query(
              "INSERT INTO posts(title, description) VALUES (?, ?)",
              [formData.title, formData.description]
            );

            res.writeHead(302, { Location: "/news" });
            res.end();
          } catch (error) {
            console.error(error);
            res.writeHead(500, {
              "Content-Type": "text/html; charset=utf-8"
            });
            res.end("<h1>Lỗi khi thêm bài viết</h1>");
          }
        });

        return;
      }

      // SỬA BÀI VIẾT - GET
      if (req.url.startsWith("/edit") && req.method === "GET") {
        const myURL = new URL(req.url, `http://localhost:${PORT}`);
        const id = myURL.searchParams.get("id");

        const [rows] = await db.query(
          "SELECT * FROM posts WHERE id = ?",
          [id]
        );

        const post = rows.length > 0 ? rows[0] : null;

        data = ejs.render(data, { post });

        res.writeHead(200, {
          "Content-Type": "text/html; charset=utf-8"
        });
        res.end(data);
        return;
      }

      // SỬA BÀI VIẾT - POST
      if (req.url === "/edit" && req.method === "POST") {
        let body = "";

        req.on("data", chunk => {
          body += chunk.toString();
        });

        req.on("end", async () => {
          try {
            const formData = querystring.parse(body);

            await db.query(
              "UPDATE posts SET title = ?, description = ? WHERE id = ?",
              [formData.title, formData.description, formData.id]
            );

            res.writeHead(302, {
              Location: "/news/" + formData.id
            });
            res.end();
          } catch (error) {
            console.error(error);
            res.writeHead(500, {
              "Content-Type": "text/html; charset=utf-8"
            });
            res.end("<h1>Lỗi khi cập nhật bài viết</h1>");
          }
        });

        return;
      }

      // CHI TIẾT / DANH SÁCH BÀI VIẾT
      if (req.url.startsWith("/news")) {
        const myURL = new URL(req.url, `http://localhost:${PORT}`);
        const parts = myURL.pathname.split("/");
        const id = parts[2];

        let newsList = [];

        if (id) {
          const [rows] = await db.query(
            "SELECT * FROM posts WHERE id = ?",
            [id]
          );
          newsList = rows;
        } else {
          const [rows] = await db.query(
            "SELECT * FROM posts ORDER BY id DESC LIMIT 10"
          );
          newsList = rows;
        }

        data = ejs.render(data, {
          id: id || "",
          newsList
        });
      }

      // TÌM KIẾM
      else if (req.url.startsWith("/search") && req.method === "GET") {
        const myURL = new URL(req.url, `http://localhost:${PORT}`);
        const keyword = myURL.searchParams.get("keyword") || "";

        const [newsList] = await db.query(
          "SELECT * FROM posts WHERE title LIKE ? OR description LIKE ?",
          [`%${keyword}%`, `%${keyword}%`]
        );

        data = ejs.render(data, {
          keyword,
          newsList
        });
      }

      // TRANG CREATE GET
      else if (req.url === "/create" && req.method === "GET") {
        data = ejs.render(data);
      }

      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8"
      });
      res.end(data);

    } catch (error) {
      console.error(error);
      res.writeHead(500, {
        "Content-Type": "text/html; charset=utf-8"
      });
      res.end("<h1>Lỗi server hoặc lỗi CSDL</h1>");
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});