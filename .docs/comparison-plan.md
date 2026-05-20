# RTK vs Zustand vs Jotai 深度比較計畫

## 比較範圍

階段一：**純 state management 對打**，async 都用各自原生方式處理。
階段二（未來）：RTK Query vs TanStack Query + Zustand/Jotai。

## 共用基礎建設

### Mock API（一份共用）

人工延遲 300~800ms，10% 機率回 500，用來展示 loading / error / rollback。

```
GET   /api/auth/me                       維度 0
PATCH /api/auth/me                       維度 0（樂觀更新）
PATCH /api/preferences                   維度 0 / 維度 4

GET   /api/users?search=&page=&sort=     維度 1, 2
GET   /api/users/:id                     維度 1
POST  /api/users                         維度 1（樂觀更新）
PATCH /api/users/:id                     維度 1
DELETE /api/users/:id                    維度 1
```

### 共用型別

```ts
type User = { id: string; name: string; email: string; createdAt: string };
type Preferences = { theme: "light" | "dark"; lang: "zh" | "en" };
type AuthUser = { id: string; name: string; email: string };
type Status = "idle" | "loading" | "success" | "error";
```

### 目錄結構

```
src/app/(pages)/compare/
├── _api/                    # 共用 mock fetch helpers
├── _types/                  # 共用型別
├── 1-user/
│   ├── context/             # React Context 基線
│   ├── rtk/
│   ├── zustand/
│   └── jotai/
├── 2-async/...
├── 3-rerender/...
├── 4-derived/...
└── 5-cross-slice/...
```

每個維度三個 page route 並排，方便：

1. 並排對照程式碼
2. bundle analyzer 量每個 route 的 First Load JS

---

## 維度 1：語法基線（1-user）

**目的**：在最單純的情境下，純粹觀察三家的語法與心智模型差異。業務邏輯刻意保持簡單，讓讀者注意力集中在 state 寫法本身。
加入 React Context 作為「不用任何 lib」的基線對照。

### 全局狀態

```ts
{
  user: AuthUser | null;
  preferences: Preferences;
  status: Status;
  error: string | null;
}
```

### 功能清單

| #   | 功能                                             | 觀察點               |
| --- | ------------------------------------------------ | -------------------- |
| 1   | Store / atom 定義                                | 初始化樣板量         |
| 2   | App 啟動時自動 `GET /api/auth`                   | async action 寫法    |
| 3   | Header 元件讀取 `user.name`                      | selector / hook 用法 |
| 4   | Sidebar 元件讀取 `preferences.theme`             | 細粒度訂閱           |
| 5   | 更新 user name（`PATCH /api/auth`）              | mutation 寫法        |
| 6   | Theme toggle（`PATCH /api/auth/preferences`）    | 第二個 mutation      |
| 7   | Logout 清空整個 store（`POST /api/auth/logout`） | reset 寫法           |

### 產出物：對照表

| 指標               | Context      | RTK          | Zustand | Jotai |
| ------------------ | ------------ | ------------ | ------- | ----- |
| 檔案數             |              |              |         |       |
| 總行數（不含註解） |              |              |         |       |
| `useXxx` hook 數量 |              |              |         |       |
| Provider 包裝需求  | `<Provider>` | `<Provider>` | 無      | 可選  |
| TS 型別需手寫量    |              |              |         |       |

---

## 維度 1：Async + Loading / Error

**目的**：比較三家處理非同步資料的心智模型。

### 功能清單

| #   | 功能                                                        | 觀察點                                                                                                |
| --- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 1   | Users 列表 `GET /users`（loading / data / error 三狀態 UI） | RTK: `createAsyncThunk` + `extraReducers`；Zustand: store 內 async；Jotai: `atom(async)` / `loadable` |
| 2   | 點擊使用者進詳情頁 `GET /users/:id`                         | route-based async 觸發                                                                                |
| 3   | 詳情頁返回列表時**不重打 API**（in-memory cache）           | 自己做 cache vs Suspense cache                                                                        |
| 4   | 新增使用者 `POST /users`（樂觀更新 + rollback）             | pending / fulfilled / rejected 三段 vs try/catch                                                      |
| 5   | 刪除使用者 `DELETE /users/:id`（樂觀更新 + rollback）       | 同上                                                                                                  |
| 6   | Retry 按鈕                                                  | 重新觸發 async 的 API                                                                                 |

### 產出物

- 每家三段程式碼截圖：定義 → 觸發 → 元件消費
- 樂觀更新行數對照
- 心得：哪家寫起來最直覺、哪家錯誤處理最完整

---

## 維度 2：Derived State 鏈

**目的**：比較衍生狀態的宣告優雅度與 re-compute 行為。

### 功能清單

基於 users 列表，建立三層依賴：

```
users (raw)
  ↓
filteredUsers (依 search + role filter)
  ↓
sortedUsers (依 sort key)
  ↓
stats = { total, byRole, avgCreatedDaysAgo }   ← 多個 derived 同時依賴 filteredUsers
```

| #   | 功能                                                                 | 觀察點                          |
| --- | -------------------------------------------------------------------- | ------------------------------- |
| 1   | Search input 即時過濾                                                | 衍生 atom / selector 的觸發成本 |
| 2   | Role filter（multi-select）+ sort key 切換                           | 多依賴組合                      |
| 3   | 統計面板：總數、各 role 計數、平均建立時間                           | 多個 derived 同時依賴中間層     |
| 4   | Render counter 顯示「stats 是否真的只在 filtered 變動時 re-compute」 | reselect vs Jotai 自動追蹤      |

### 產出物

- 各家 derived 宣告語法對照
- 「修改 search 時，stats 重算次數」實測（用 ref + counter）

---

## 維度 3：細粒度 Re-render

**目的**：壓力測試 atom-per-field（Jotai）vs selector（Zustand）vs Redux memo 的差異。

### 功能清單

20 欄位的大表單（模擬 user profile + address + preferences），每欄位旁邊放 render counter。

| #   | 功能                                            | 觀察點               |
| --- | ----------------------------------------------- | -------------------- |
| 1   | 輸入任一欄位，**其他欄位不應 re-render**        | 細粒度訂閱           |
| 2   | 即時驗證：每欄位顯示自己的 error                | 衍生狀態 + 細粒度    |
| 3   | 整體 isValid 狀態（提交按鈕用）                 | 跨欄位 derived       |
| 4   | Submit `PATCH /me`（loading 期間 disable 全部） | 全局狀態影響每個欄位 |
| 5   | Render counter：每個欄位顯示自己被 render 幾次  | 量化差異             |

### 產出物

- 操作 10 次後，三家的「總 render 次數」對照
- 寫法樣板量對照（Jotai atom-per-field 是否真的零負擔？）

---

## 維度 4：跨 Slice 依賴

**目的**：比較跨領域 state 互動的寫法。**直接複用維度 0 的 user + preferences，再加上 todos。**

### 全局狀態擴充

```ts
{
  auth: { user, status, error }              # 維度 0 已有
  preferences: { theme, lang }                # 維度 0 已有
  todos: { items: Todo[], status, error }     # 新增
}

type Todo = { id; title; ownerId; lang: 'zh' | 'en' };
```

### 功能清單

| #   | 功能                                               | 觀察點                                                                       |
| --- | -------------------------------------------------- | ---------------------------------------------------------------------------- |
| 1   | Login（set user）後**自動 fetch 該 user 的 todos** | RTK: listener middleware；Zustand: `subscribe`；Jotai: derived atom 自動依賴 |
| 2   | 切換 `preferences.lang` → todos 只顯示對應語言     | derived + 跨 slice                                                           |
| 3   | Logout → 同時清空 user 與 todos                    | 一個 action 影響多 slice                                                     |
| 4   | Todo 計數 badge（顯示在 Header）                   | 跨元件、跨 slice 衍生                                                        |

### 產出物

- 「user 變動觸發 todos fetch」的三家寫法對照
- 評估：哪家最自然、哪家最容易出 bug

---

## 維度 5：Bundle Size

**目的**：實際下載量比較。

### 量測方法

- `@next/bundle-analyzer` 看每個 page route 的 First Load JS
- **每個維度都各量一次**（不是只量一次 demo）：因為 RTK 在簡單場景和複雜場景下的 tree-shaking 表現不同

### 量測對象

| 維度 | route                                 | 量測指標      |
| ---- | ------------------------------------- | ------------- |
| 1    | `/1-user/{context,rtk,zustand,jotai}` | First Load JS |
| 2    | `/2-async/{rtk,zustand,jotai}`        | First Load JS |
| 3    | `/3-rerender/{rtk,zustand,jotai}`     | First Load JS |
| 4    | `/4-derived/{rtk,zustand,jotai}`      | First Load JS |
| 5    | `/5-cross-slice/{rtk,zustand,jotai}`  | First Load JS |

### 注意事項

- RTK 只用 core（`@reduxjs/toolkit` + `react-redux`），**不 import RTK Query**
- 確認 tree-shaking 真的生效（用 bundle analyzer 看 chunk 內容）
- 同一維度三家的「業務邏輯」要對等，不能有人多做事

### 產出物

```
| 維度 | RTK | Zustand | Jotai | 備註 |
|---|---|---|---|---|
| 0   | xx KB | xx KB | xx KB |  |
| 1   | xx KB | xx KB | xx KB |  |
| ... |       |       |       |  |
```

---

## 執行順序

1. ✅ **基礎建設**：API routes + 共用型別 + 目錄結構
2. **維度 1**（語法基線 `1-user`）→ 跑第一次 bundle 分析
3. **維度 2**（async `2-async`）
4. **維度 3**（re-render `3-rerender`）← 直觀感受最強
5. **維度 4**（derived `4-derived`）
6. **維度 5**（跨 slice `5-cross-slice`）← 複用維度 1 state
7. **整理最終報告**：五個維度交叉對照表 + 選型建議

## 最終產出物

一份 `.docs/comparison-result.md`，包含：

1. 五個維度的程式碼對照
2. Bundle size 總表
3. **選型建議矩陣**：
   - 「小型專案、追求最小樣板」→ ?
   - 「大型團隊、需要 DevTools / time-travel」→ ?
   - 「重表單、重細粒度」→ ?
   - 「重 derived state / 計算鏈」→ ?
