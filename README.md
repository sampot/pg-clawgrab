# pg-clawgrab

夜市風**夾娃娃**：機台視角、左右移爪、下爪抓絨玩偶，略帶喜劇失手與擦身而過。純前端，無建置步驟。

名稱與角色為原創小品，致敬「夾娃娃機／crane claw」玩法類型，非任一商業作品復刻。

也可當作 [Playgrounds（遊樂場）](https://play.samkuo.me/) 的 **SAM**（`index.html` 入口）。手感想再調？開進來玩，再叫 AI 幫你改一版。

## 一鍵開 SAM 小

**[一鍵開 SAM 小](https://play.samkuo.me/?open=sampot%2Fpg-clawgrab&name=%E5%A4%BE%E5%A8%83%E5%A8%83)**

```
https://play.samkuo.me/?open=sampot/pg-clawgrab&name=夾娃娃
```

同源會重用本機已匯入的沙盒；要強制新建可加 `&fresh=1`。

## 試玩（本機）

```bash
npx --yes serve .
# 或
python3 -m http.server 8080
```

點一下頁面後音效才會出聲。

## 操作

| 操作 | 說明 |
| --- | --- |
| ← → 按鈕／拖曳畫面／鍵盤 | 爪子左右移動 |
| 下爪／空白鍵／Enter | 放下爪子嘗試抓取 |
| 開台 | 花 1 枚代幣開始瞄準 |
| 投幣 +3 | 補充代幣 |
| 音效開／關 | 靜音 |
| 重來 | 分數、獎品、代幣歸零 |

對得越準越容易夾到，但仍會喜劇滑爪——近在咫尺也常失手。技巧＋運氣。

## 檔案

| 檔案 | 說明 |
| --- | --- |
| `index.html` | 結構 |
| `styles.css` | 亮／暗色主題、大觸控板 |
| `app.js` | Canvas、輸入、HUD |
| `game.js` | 移爪、下爪、喜劇抓取機率 |
| `sprites.js` | 機台、爪子、絨玩偶 |
| `audio.js` | Web Audio 合成音效 |
| `functions.js` | Playgrounds 可選 stub |

## License

MIT
