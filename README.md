# User Data Retrieval API（NestJS + Prisma + JWT + RBAC）

此專案提供：

- 使用 NestJS 建立的 REST API
- 使用 Prisma ORM 操作資料庫（MySQL）
- JWT Bearer Token 驗證（必須帶 `Authorization: Bearer <token>`）
- 使用者角色（`ADMIN` / `USER`）權限控制：`HKID Number` 只有 `ADMIN` 才能看完整，`USER` 只能看到遮罩格式（例：`A****123`）
- 分頁支援：`?page=1&limit=10`，回傳固定 Envelope：`{ total, page, limit, data }`
- 列表模糊查詢：`?q=關鍵字`（Name / Email / ID）
- ADMIN 可新增 / 修改 / 刪除使用者（單筆）

---

## 1. 環境需求

- Node.js（建議 20+；此專案使用 Prisma 7，Node 22 亦可）
- npm
- Windows / macOS / Linux 均可
- **MySQL 伺服器**（本機或遠端皆可）
- （推薦）Docker + Docker Compose（可一鍵啟動 API + Web + MySQL）

---

## 2. Docker Compose 一鍵啟動（推薦）

如果你希望「別人拿到你的程式碼後」可以用一個指令直接跑起來，請使用本專案提供的 `docker-compose.yml`。

### 2.0 先決條件（必裝）

- 安裝 Docker Desktop（Windows / macOS）或 Docker Engine（Linux）
- 確認終端可用以下指令：

```bash
docker --version
docker compose version
```

> 若你的環境是舊版 docker-compose（有連字號），也可以用 `docker-compose up --build`，效果相同。

### 2.1 直接啟動（包含 MySQL）

在專案根目錄執行：

```bash
docker compose up --build
```

如果你想背景執行（不佔住終端）：

```bash
docker compose up -d --build
```

啟動完成後：

- 前端（Next.js）：`http://localhost:3000`
- 後端（NestJS API）：`http://localhost:3002`
- MySQL：
  - Docker 內部（給 API 連線用）：`db:3306`
  - 本機連線（給 Workbench / Navicat 用）：`localhost:3307`（可用環境變數 `MYSQL_HOST_PORT` 改掉；帳密與 DB 名稱請看 `docker-compose.yml`）

第一次啟動時，API 會自動執行 migration 建表，並在資料庫為空時自動 seed 50 筆測試資料。

### 2.1.1 檢查是否啟動成功

查看容器狀態：

```bash
docker compose ps
```

查看 API log（第一次會看到 migrate / seed 相關訊息）：

```bash
docker compose logs -f api
```

### 2.1.2 常見問題（埠號被占用）

如果你的機器已經有人佔用以下埠號：

- `3000`（前端）
- `3002`（後端）
- `3306`（MySQL）

請先關閉佔用該埠號的程式，或修改 [docker-compose.yml](file:///d:/nodejs_Demo/NestJS-Task/docker-compose.yml) 裡的 `ports:` 映射後再啟動。

本專案 MySQL 對外預設使用 `3307 -> 3306` 以避免與本機 MySQL（常見佔用 `3306`）衝突；如需指定其他埠號：

```bash
MYSQL_HOST_PORT=3308 docker compose up -d --build
```

### 2.2 停止與清除資料庫

停止容器：

```bash
docker compose down
```

如果你要把資料庫也清掉（會刪掉所有資料），再執行：

```bash
docker compose down -v
```

### 2.3 重新建置（程式碼有改）

```bash
docker compose up --build
```

如果你想完全不使用快取重新 build：

```bash
docker compose build --no-cache
docker compose up
```

### 2.4 在 Docker 裡操作 MySQL（查資料 / 執行 SQL）

本專案的 MySQL 服務名稱是 `db`（容器通常叫 `nestjs-task-db-1`）。你可以直接在 Docker 裡用 `mysql` 指令查資料。

#### 2.4.1 進入 MySQL 互動模式

```bash
docker compose exec db mysql -uroot -p
```

看到 `Enter password:` 時輸入 `MYSQL_ROOT_PASSWORD`（本專案預設為 `rootpass`，以 `docker-compose.yml` 為準）。

登入成功後會看到 `mysql>` 提示符，這時才可以輸入 SQL：

```sql
SHOW DATABASES;
USE app;
SHOW TABLES;
SELECT COUNT(*) FROM User;
SELECT * FROM User LIMIT 10;
```

離開：

```sql
exit
```

#### 2.4.2 不進互動模式，直接執行單條 SQL

```bash
docker compose exec db mysql -uroot -prootpass -e "SHOW DATABASES;"
docker compose exec db mysql -uroot -prootpass -e "SHOW TABLES;" app
docker compose exec db mysql -uroot -prootpass -e "SELECT * FROM User LIMIT 10;" app
```

#### 2.4.3 用本機工具連線（Workbench / Navicat）

本專案預設把 MySQL 映射到本機 `3307`（可用 `MYSQL_HOST_PORT` 自訂），因此本機連線參數通常是：

- Host: `127.0.0.1`
- Port: `3307`
- Database: `app`
- 帳密：以 `docker-compose.yml` 的 `MYSQL_USER` / `MYSQL_PASSWORD` 或 `MYSQL_ROOT_PASSWORD` 為準

#### 2.4.4 常見問題：改了 MySQL 密碼但登入失敗

MySQL 第一次啟動後，資料與帳密資訊會保存在 volume（本專案是 `db_data`）。後續就算你修改了 `docker-compose.yml` 的 `MYSQL_ROOT_PASSWORD`，也不會自動更新已存在的資料庫。

如果你是開發環境且允許清空資料庫，可以這樣重置（會刪掉所有 DB 資料）：

```bash
docker compose down -v
docker compose up -d --build
```

---

## 3. 專案初始化（本機跑，第一次必做）

請在專案根目錄執行：

```bash
npm install
```

---

## 4. 資料庫與 Prisma 設定（本機跑）

> 本專案使用 Prisma 7。連線字串不再寫在 `schema.prisma` 的 `datasource.url`，而是透過 [prisma.config.ts](file:///d:/nodejs_Demo/NestJS-Task/prisma.config.ts) 提供給 migrate 使用。

### 4.1 設定環境變數

專案根目錄有 `.env` 檔案，請先設定你的 MySQL 連線字串：

```env
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/DB_NAME"
JWT_SECRET="dev-secret"
JWT_EXPIRES_IN="1h"
```
*(請將 `USER`、`PASSWORD`、`DB_NAME` 換成你真實的 MySQL 帳號、密碼與資料庫名稱)*

如果你是用本專案的 Docker Compose 啟動 MySQL，且你要在本機直接執行 Prisma CLI（例如 `migrate dev`），請把連線埠號改成 `3307`（或你設定的 `MYSQL_HOST_PORT`）。

### 4.2 產生 Prisma Client

```bash
npx prisma generate
```

### 4.3 建立資料表（Migration）

```bash
npx prisma migrate dev --name init
```
執行成功後，Prisma 會在你的 MySQL 中建立好 `User` 資料表。

---
### 4.4 手動 Seed（本機開發）
若你在本機開發，當你執行 `npx prisma migrate dev` 後，系統會**自動觸發** Seed 機制寫入初始資料。

如果因為某些原因資料庫被清空，你也可以隨時手動執行：
```bash
npx prisma db seed
```

## 5. 啟動專案（本機跑）

### 5.1 一般啟動（預設 3000）

```bash
npm run start
```
預設服務位址：`http://localhost:3000`

### 5.2 推薦：指定後端埠號（3002，避免 3000 被占用）

```bash
npm run api:dev
```

後端位址：`http://localhost:3002`

### 5.3 監聽模式（開發用）

```bash
npm run start:dev
```

---

## 6. 預設測試帳號（Seed 50 筆資料）

為了方便測試**分頁功能**與**權限控制**，系統提供指令自動寫入 **50 筆** 測試資料（包含 ADMIN 與 USER 角色）。

### 6.1 自動 Seed（使用 Docker Compose）
若你使用 `docker compose up` 啟動，容器在建置時會自動執行 migration 與 seed，你不需要做任何事，資料庫就會有 50 筆測試資料。

### 6.2 手動 Seed（本機開發）
若你在本機開發，當你執行 `npx prisma migrate dev` 後，系統會**自動觸發** Seed 機制寫入初始資料。

如果因為某些原因資料庫被清空，你也可以隨時手動執行：
```bash
npx prisma db seed
```

### 6.3 測試帳號清單
- **主要測試帳號 1 (ADMIN)**
  - Email: `admin@example.com`
  - Password: `admin123`
- **主要測試帳號 2 (USER)**
  - Email: `user@example.com`
  - Password: `user123`
- **其他 48 筆模擬用戶**
  - Email: `mockuser1@example.com` ~ `mockuser48@example.com`
  - Password: 統一為 `password123`
  - 角色：每 10 筆會有一個 `ADMIN`，其餘皆為 `USER`。

---

## 7. 使用 Postman 測試 API 步驟（推薦）

以下是如何使用 Postman 介面來測試 API 的詳細圖文步驟：

### 7.1 步驟一：登入取得 JWT Token (POST /auth/login)
1. 打開 Postman，建立一個新的請求。
2. 請求方法選擇 **POST**。
3. 網址輸入：
   - 若你用 `npm run start`：`http://localhost:3000/auth/login`
   - 若你用 `npm run api:dev` 或 Docker Compose：`http://localhost:3002/auth/login`
4. 點擊下方的 **Body** 頁籤。
5. 選擇 **raw**，並在最右邊的格式下拉選單選擇 **JSON**。
6. 在文字框輸入以下內容：
   ```json
   {
       "email": "admin@example.com",
       "password": "admin123"
   }
   ```
7. 點擊 **Send** 發送請求。
8. 你會在下方 Response 區塊看到回傳了 `accessToken`。**請複製這串 Token**（不要複製到雙引號）。

### 7.2 步驟二：查詢單一使用者 (GET /users/:id)
1. 在 Postman 建立一個新的請求。
2. 請求方法選擇 **GET**。
3. 網址輸入：
   - `http://localhost:3000/users/2` 或 `http://localhost:3002/users/2`（依你後端實際埠號）
4. 點擊下方的 **Authorization** 頁籤。
5. Type 選擇 **Bearer Token**。
6. 在右側的 **Token** 欄位，貼上剛剛複製的 `accessToken`。
7. 點擊 **Send** 發送請求。
8. **驗證結果**：
   - 因為你是用 `admin@example.com` (ADMIN) 登入的，所以你看到的 `hkidNumber` 會是完整的值（例如 `B7654321`）。
   - *（你可以試著回到步驟一，改用 `user@example.com` / `user123` 登入拿 Token，再查詢一次，就會發現 `hkidNumber` 變成遮罩格式 `B****321`）*

### 7.3 步驟三：測試分頁列表 (GET /users?page=X&limit=Y)
1. 在 Postman 建立一個新的請求。
2. 請求方法選擇 **GET**。
3. 網址輸入：
   - `http://localhost:3000/users?page=2&limit=5` 或 `http://localhost:3002/users?page=2&limit=5`
4. 點擊下方的 **Authorization** 頁籤，Type 一樣選擇 **Bearer Token** 並貼上 Token。
5. 點擊 **Send**。
6. **驗證結果**：
   - 你會看到回傳的 JSON 結構包含了 `total: 50`。
   - `data` 陣列裡面剛好只有 5 筆資料（ID 為 6 ~ 10 的用戶）。

---

## 8. 參數驗證與錯誤回應說明

### 7.1 `id` 必須是整數
若呼叫 `/users/abc` 這種非整數 ID，會被攔截並回傳 `400 Bad Request`。

### 7.2 未帶 Token / Token 錯誤
若未帶 `Authorization: Bearer <token>` 或 token 已過期、竄改，會回傳 `401 Unauthorized`。

---

## 9. 專案核心目錄結構

- `prisma/schema.prisma`：定義 MySQL 資料表與欄位。
- `prisma/seed.ts`：資料庫初始化腳本（建立 50 筆初始測試資料）。
- `prisma.config.ts`：Prisma 7 的設定檔（包含 datasource url 與 seed 執行指令）。
- `src/prisma/prisma.service.ts`：Prisma 連線服務（掛載 MariaDB Adapter）。
- `src/auth/`：登入邏輯、JWT 簽發與 Passport 驗證策略。
- `src/users/`：查詢使用者、分頁處理與 RBAC (HKID 遮罩) 商業邏輯。
- `src/common/roles.guard.ts`：用來判斷當前請求使用者身分的 Guard。

---

## 10. Task 2：User Information Webpage（Next.js 16 + Ant Design）

前端專案位於：`frontend/`，使用 Next.js 16 App Router + Ant Design（antd），並呼叫本專案後端 API。
此專案採用「前後端同一個 Repository」的方式管理：後端（NestJS）與前端（Next.js）放在同一個資料夾下。

### 10.1 啟動方式（本機開發）

需要同時啟動後端與前端（使用不同埠號）：

#### 方式 A：一個指令同時啟動前後端（推薦）

```bash
npm run dev
```

此指令會同時啟動：

- 後端（NestJS）：`http://localhost:3002`
- 前端（Next.js）：預設 `http://localhost:3000`（若 3000 被占用，Next 會自動換到其他埠號並在終端顯示）

#### 方式 B：分開啟動（需要兩個終端）

1. 啟動後端（3002）：

```bash
npm run api:dev
```

2. 啟動前端（預設 3000）：

```bash
cd frontend
npm run dev
```

3. 瀏覽器開啟：

- `http://localhost:3000/login`（或以實際 Next 顯示的埠號為準）

### 10.2 前端路由規格

- `/login`：登入頁，成功後會將 JWT 存入 Cookie，並跳轉到 `/user`
- `/user`：使用者列表（表格顯示 ID / Name / Age）
  - 支援分頁（點擊下一頁 / 上一頁）
  - 支援模糊查詢（Name / Email / ID）
  - ADMIN 角色可新增 / 修改 / 刪除（單筆）；`name=Admin` 的資料不允許刪除
- `/user/<ID>`：使用者詳情頁（顯示 ID / Name / Age / HKID），並提供「返回列表」按鈕

### 10.3 登入與路由保護

- 未登入時造訪 `/user/*` 會自動跳轉 `/login`
- 已登入時造訪 `/login` 會自動跳轉 `/user`

前端是用 Cookie 來判斷是否已登入（`token` cookie 存 JWT）。

### 10.4 HKID 顯示規則（前端 UI）

在 `/user/<ID>` 頁面：

- HKID 預設會被隱藏
- 若登入者是 `ADMIN`：
  - 會顯示「顯示/隱藏」按鈕，點擊後可切換顯示 HKID
- 若登入者是 `USER`：
  - 不會顯示切換按鈕
  - 只能看到後端已遮罩的 HKID（例如 `A****123`）

### 10.5 自動更新（每 1 分鐘）

- `/user` 與 `/user/<ID>` 都會每 60 秒自動重新抓取資料並更新畫面。

### 10.6 前端對接後端 API 的方式

為了避免在瀏覽器端直接暴露 JWT，前端透過 Next.js 的 Route Handlers 做「同源代理」：

- 前端頁面呼叫 `/api/users`、`/api/users/<ID>`（同源）
- Next 伺服器端從 Cookie 取出 `token`，轉發到後端 API 並加上 Header：`Authorization: Bearer <token>`

### 10.7（可選）設定後端 API 位址

預設後端 API 位址是 `http://localhost:3002`。

若你的後端不在此位址，可在前端環境變數設定：

- `API_BASE_URL`（例如 `http://localhost:3002`）

對應程式碼會讀取 `process.env.API_BASE_URL`。

---
