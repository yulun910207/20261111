// 宣告背景圖片與所有角色精靈圖。
let backgroundImage; // 儲存全螢幕背景圖。
let playerStopSheet; // 儲存角色一的待機精靈圖。
let playerRunSheet; // 儲存角色一的跑步精靈圖。
let partnerStopSheet; // 儲存角色二的待機精靈圖。
let partnerCorrectSheet; // 儲存角色二的答對精靈圖。
let partnerIncorrectSheet; // 儲存角色二的答錯精靈圖。

// 設定實際素材中的影格數；跑步圖實際有 9 格，而不是需求描述的 12 格。
const PLAYER_STOP_FRAMES = 14; // 設定角色一待機動畫的影格數。
const PLAYER_RUN_FRAMES = 9; // 設定角色一跑步動畫的實際影格數。
const PARTNER_STOP_FRAMES = 6; // 設定角色二待機動畫的影格數。
const PARTNER_CORRECT_FRAMES = 8; // 設定角色二答對動畫的影格數。
const PARTNER_INCORRECT_FRAMES = 25; // 設定角色二答錯動畫的影格數。
const FRAME_INTERVAL = 100; // 設定動畫每格切換的毫秒數。
const PLAYER_SCALE = 1.5; // 將角色一目前尺寸放大為一點五倍。
const PARTNER_SCALE = 3; // 將角色二目前尺寸放大為一點五倍。
const PLAYER_SPEED = 4; // 設定角色一每影格的移動速度。
const MEET_DISTANCE = 150; // 設定角色一靠近角色二時的觸發距離。

// 記錄角色位置、動畫播放狀態與問答狀態。
let playerX; // 記錄角色一畫面上的水平中心位置。
let playerFacing = 1; // 記錄角色一朝向，1 為右，-1 為左。
let runStartedAt = 0; // 記錄本次跑步動畫開始時間。
let wasMoving = false; // 記錄上一影格角色是否正在移動。
let questionVisible = false; // 記錄是否正在顯示題目。
let partnerMood = null; // 記錄角色二的反應，null 代表待機。
let answerButtons = []; // 儲存題目選項的畫面位置。
let partnerIncorrectFrameBottoms = []; // 儲存答錯動畫每格角色可見內容的底部位置。

// 在載入畫面前讀取所有圖片素材。
function preload() { // 定義素材預載入函式。
  backgroundImage = loadImage('bg/bg.png'); // 載入背景圖片。
  playerStopSheet = loadImage('1/stop/stop.png'); // 載入角色一待機精靈圖。
  playerRunSheet = loadImage('1/run/run.png'); // 載入角色一跑步精靈圖。
  partnerStopSheet = loadImage('2/stop/stop.png'); // 載入角色二待機精靈圖。
  partnerCorrectSheet = loadImage('2/correct/correct.png'); // 載入角色二答對精靈圖。
  partnerIncorrectSheet = loadImage('2/incorrect/incorrcet.png'); // 載入實際檔名拼字有誤的答錯精靈圖。
} // 結束素材預載入函式。

// 建立配合視窗大小的全螢幕畫布。
function setup() { // 定義畫布初始化函式。
  createCanvas(windowWidth, windowHeight); // 建立視窗大小的畫布。
  imageMode(CENTER); // 讓圖片座標以中心點定位。
  textFont('sans-serif'); // 設定易讀的無襯線字型。
  playerX = width * 2 / 3; // 將角色一放在畫面寬度的三分之二處。
  partnerIncorrectFrameBottoms = getSpriteFrameBottoms(partnerIncorrectSheet, PARTNER_INCORRECT_FRAMES); // 計算答錯精靈圖每格角色實際可見的底部位置。
} // 結束畫布初始化函式。

// 每一影格更新角色位置、背景與動畫畫面。
function draw() { // 定義每影格繪圖函式。
  drawBackground(); // 繪製填滿畫面的背景。
  movePlayer(); // 依照左右方向鍵更新角色一的位置。
  updateEncounter(); // 判斷是否靠近角色二並更新問答狀態。
  drawPartner(); // 繪製位於畫面三分之一處的角色二。
  drawPlayer(); // 繪製角色一的待機或跑步動畫。
  if (questionVisible) { // 如果題目正在顯示。
    drawQuestion(); // 繪製選擇題方框與選項。
  } // 結束題目顯示判斷。
} // 結束每影格繪圖函式。

// 將背景圖片拉伸至整個視窗。
function drawBackground() { // 定義背景繪圖函式。
  image(backgroundImage, width / 2, height / 2, width, height); // 讓背景圖片填滿畫布。
} // 結束背景繪圖函式。

// 依照左右方向鍵移動角色一，並限制角色留在畫面內。
function movePlayer() { // 定義角色移動函式。
  let direction = 0; // 初始化本影格的移動方向。
  if (keyIsDown(LEFT_ARROW)) { // 如果按住左方向鍵。
    direction -= 1; // 設定角色向左移動。
  } // 結束左方向鍵判斷。
  if (keyIsDown(RIGHT_ARROW)) { // 如果按住右方向鍵。
    direction += 1; // 設定角色向右移動。
  } // 結束右方向鍵判斷。
  if (direction !== 0) { // 如果角色正在移動。
    if (!wasMoving || direction !== playerFacing) { // 如果剛開始移動或改變方向。
      runStartedAt = millis(); // 從第一格重新開始跑步動畫。
    } // 結束方向切換判斷。
    wasMoving = true; // 記錄角色目前正在移動。
    playerFacing = direction; // 記錄角色目前的朝向。
    playerX += direction * PLAYER_SPEED; // 按照方向與速度更新角色位置。
  } else { // 如果本影格沒有按下移動方向鍵。
    wasMoving = false; // 記錄角色目前已停止移動。
  } // 結束移動狀態判斷。
  playerX = constrain(playerX, 40, width - 40); // 避免角色中心移出畫面邊界。
} // 結束角色移動函式。

// 根據角色距離切換題目、答題動畫與待機狀態。
function updateEncounter() { // 定義接近角色二時的互動更新函式。
  const partnerX = width / 3; // 計算角色二位於畫面寬度三分之一處。
  const distance = abs(playerX - partnerX); // 計算角色一與角色二的水平距離。
  if (distance <= MEET_DISTANCE && partnerMood === null && !questionVisible) { // 如果初次靠近且尚未答題。
    questionVisible = true; // 顯示選擇題。
  } // 結束開始問答的條件判斷。
  if (distance > MEET_DISTANCE + 40) { // 如果角色一已經明顯遠離角色二。
    questionVisible = false; // 關閉尚未回答的題目。
    partnerMood = null; // 將角色二恢復成待機狀態。
  } // 結束遠離角色的條件判斷。
} // 結束互動更新函式。

// 根據目前狀態繪製角色二的放大動畫。
function drawPartner() { // 定義角色二繪圖函式。
  const x = width / 3; // 設定角色二的水平中心位置為畫面三分之一處。
  if (partnerMood === 'correct') { // 如果角色二需要播放答對動畫。
    const frame = getLoopingFrame(PARTNER_CORRECT_FRAMES); // 取得答對動畫的循環影格。
    const y = height - partnerCorrectSheet.height * PARTNER_SCALE / 2; // 讓答對動畫放大後的底部貼齊畫面底部。
    drawSpriteFrame(partnerCorrectSheet, frame, PARTNER_CORRECT_FRAMES, PARTNER_SCALE, x, y); // 繪製放大的答對動畫影格。
  } else if (partnerMood === 'incorrect') { // 如果角色二需要播放答錯動畫。
    const frame = getLoopingFrame(PARTNER_INCORRECT_FRAMES); // 取得答錯動畫的循環影格。
    const frameHeight = partnerIncorrectSheet.height; // 取得答錯動畫單格的高度。
    const visibleBottom = partnerIncorrectFrameBottoms[frame]; // 取得目前影格中角色可見內容的最下方位置。
    const y = height + (frameHeight / 2 - visibleBottom) * PARTNER_SCALE; // 依照目前影格透明留白調整位置，讓角色底部貼齊畫面。
    drawSpriteFrame(partnerIncorrectSheet, frame, PARTNER_INCORRECT_FRAMES, PARTNER_SCALE, x, y); // 繪製放大的答錯動畫影格。
  } else { // 如果尚未答題或已經恢復待機。
    const frame = getLoopingFrame(PARTNER_STOP_FRAMES); // 取得六格待機動畫的循環影格。
    const y = height - partnerStopSheet.height * PARTNER_SCALE / 2; // 讓待機動畫放大後的底部貼齊畫面底部。
    drawSpriteFrame(partnerStopSheet, frame, PARTNER_STOP_FRAMES, PARTNER_SCALE, x, y); // 繪製放大兩倍的待機動畫影格。
  } // 結束角色二狀態判斷。
} // 結束角色二繪圖函式。

// 根據方向鍵狀態繪製角色一的待機或跑步影格。
function drawPlayer() { // 定義角色一繪圖函式。
  const moving = keyIsDown(LEFT_ARROW) !== keyIsDown(RIGHT_ARROW); // 判斷是否剛好按住一個方向鍵。
  const frameCount = moving ? PLAYER_RUN_FRAMES : PLAYER_STOP_FRAMES; // 選擇跑步或待機動畫的影格數。
  const sheet = moving ? playerRunSheet : playerStopSheet; // 選擇跑步或待機精靈圖。
  const frame = moving ? getRunFrame() : getLoopingFrame(frameCount); // 取得對應動畫的影格編號。
  const frameWidth = sheet.width / frameCount; // 根據精靈圖寬度計算單格寬度。
  const frameHeight = sheet.height; // 取得單格影格的高度。
  const y = height - frameHeight * PLAYER_SCALE / 2; // 讓角色一放大後的底部貼齊畫面底部。
  push(); // 儲存目前畫布的座標與縮放狀態。
  translate(playerX, y); // 將座標原點移至角色一的繪製位置。
  scale(playerFacing, 1); // 朝左時水平翻轉圖片以改變角色朝向。
  image(sheet, 0, 0, frameWidth * PLAYER_SCALE, frameHeight * PLAYER_SCALE, frame * frameWidth, 0, frameWidth, frameHeight); // 繪製精靈圖中的指定影格。
  pop(); // 還原畫布的座標與縮放狀態。
} // 結束角色一繪圖函式。

// 讓角色一先播放完整跑步動畫，再重複最後幾格。
function getRunFrame() { // 定義跑步動畫影格計算函式。
  const elapsedFrames = floor((millis() - runStartedAt) / FRAME_INTERVAL); // 計算本次跑步已經播放的影格數。
  if (elapsedFrames < PLAYER_RUN_FRAMES) { // 如果尚未播放完整個跑步動畫。
    return elapsedFrames; // 按照順序播放跑步影格。
  } // 結束首次播放的判斷。
  return 5 + (elapsedFrames - 5) % (PLAYER_RUN_FRAMES - 5); // 從第六格起循環播放剩餘跑步影格。
} // 結束跑步動畫影格計算函式。

// 取得持續循環播放的動畫影格編號。
function getLoopingFrame(frameCount) { // 定義循環動畫影格計算函式。
  return floor(millis() / FRAME_INTERVAL) % frameCount; // 依照經過時間循環取得影格。
} // 結束循環動畫影格計算函式。

// 從橫向精靈圖裁切一格並依照指定倍率繪製。
function drawSpriteFrame(sheet, frame, frameCount, scaleFactor, x, y) { // 定義精靈圖單格繪製函式。
  const frameWidth = sheet.width / frameCount; // 計算每格精靈圖的寬度。
  const frameHeight = sheet.height; // 取得每格精靈圖的高度。
  image(sheet, x, y, frameWidth * scaleFactor, frameHeight * scaleFactor, frame * frameWidth, 0, frameWidth, frameHeight); // 繪製指定影格並放大。
} // 結束精靈圖單格繪製函式。

// 掃描精靈圖每格的透明像素，取得角色實際可見的底部位置。
function getSpriteFrameBottoms(sheet, frameCount) { // 定義計算各影格可見底部位置的函式。
  sheet.loadPixels(); // 將圖片像素載入記憶體以讀取透明度。
  const frameWidth = sheet.width / frameCount; // 計算每格精靈圖的寬度。
  const frameBottoms = []; // 建立儲存每格可見底部位置的陣列。
  for (let frame = 0; frame < frameCount; frame += 1) { // 逐一掃描所有動畫影格。
    const firstX = floor(frame * frameWidth); // 計算目前影格最左側的像素位置。
    const lastX = min(sheet.width - 1, ceil((frame + 1) * frameWidth) - 1); // 計算目前影格最右側的像素位置。
    let bottom = -1; // 初始化目前影格的可見底部位置。
    for (let y = sheet.height - 1; y >= 0 && bottom === -1; y -= 1) { // 從影格底部往上尋找不透明像素。
      for (let x = firstX; x <= lastX; x += 1) { // 檢查目前水平列中的像素。
        const alphaIndex = (y * sheet.width + x) * 4 + 3; // 計算目前像素的透明度資料索引。
        if (sheet.pixels[alphaIndex] > 0) { // 如果目前像素不是完全透明。
          bottom = y; // 記錄角色可見內容的最下方位置。
          break; // 找到此列像素後停止水平掃描。
        } // 結束像素透明度判斷。
      } // 結束水平像素掃描。
    } // 結束由下往上的垂直掃描。
    frameBottoms.push(bottom); // 儲存目前影格的可見底部位置。
  } // 結束所有影格掃描。
  return frameBottoms; // 傳回每格精靈圖的可見底部位置。
} // 結束計算可見底部位置的函式。

// 在畫面中央繪製半透明紅色選擇題方框與選項。
function drawQuestion() { // 定義選擇題繪圖函式。
  const boxWidth = width / 4; // 設定題目方框寬度為視窗寬度的四分之一。
  const boxHeight = height / 4; // 設定題目方框高度為視窗高度的四分之一。
  const boxX = (width - boxWidth) / 2; // 計算題目方框左上角的水平位置。
  const boxY = (height - boxHeight) / 2; // 計算題目方框左上角的垂直位置。
  answerButtons = []; // 清除上一影格的選項點擊範圍。
  noStroke(); // 移除方框與選項按鈕的外框。
  fill(220, 0, 0, 153); // 設定紅色底框並使用約百分之六十透明度。
  rect(boxX, boxY, boxWidth, boxHeight, 12); // 繪製置中的選擇題方框。
  fill(255); // 將文字顏色設為白色。
  textAlign(CENTER, CENTER); // 設定題目與選項文字置中對齊。
  textSize(max(14, width * 0.015)); // 根據畫面寬度設定易讀的字體大小。
  text('請問 7 + 5 = ?', width / 2, boxY + boxHeight * 0.25); // 顯示選擇題題目。
  const options = ['10', '12', '13']; // 設定三個可供選擇的答案。
  const buttonWidth = boxWidth * 0.25; // 設定選項按鈕寬度。
  const buttonHeight = boxHeight * 0.28; // 設定選項按鈕高度。
  for (let index = 0; index < options.length; index += 1) { // 依序繪製三個答案選項。
    const buttonX = width / 2 + (index - 1) * boxWidth * 0.31; // 計算目前選項按鈕的水平中心位置。
    const buttonY = boxY + boxHeight * 0.68; // 計算目前選項按鈕的垂直中心位置。
    fill(255, 255, 255, 220); // 設定選項按鈕的半透明白色底色。
    rect(buttonX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight, 8); // 繪製目前的答案按鈕。
    fill(130, 0, 0); // 設定選項文字的深紅色。
    text((index + 1) + '. ' + options[index], buttonX, buttonY); // 顯示選項編號與答案內容。
    answerButtons.push({ x: buttonX - buttonWidth / 2, y: buttonY - buttonHeight / 2, width: buttonWidth, height: buttonHeight, answer: options[index] }); // 記錄選項的滑鼠點擊範圍與答案。
  } // 結束選項繪製迴圈。
  fill(255); // 將操作提示文字設為白色。
  textSize(max(11, width * 0.01)); // 設定操作提示的字體大小。
  text('按 1、2、3 或點擊答案作答', width / 2, boxY + boxHeight * 0.91); // 顯示鍵盤與滑鼠操作方式。
} // 結束選擇題繪圖函式。

// 根據選項答案關閉題目並開始角色二的對應循環動畫。
function submitAnswer(answer) { // 定義答案提交函式。
  if (!questionVisible) { // 如果目前沒有題目可供回答。
    return; // 忽略這次作答。
  } // 結束題目狀態檢查。
  questionVisible = false; // 回答後隱藏選擇題方框。
  partnerMood = answer === '12' ? 'correct' : 'incorrect'; // 根據答案正確與否設定角色二的反應動畫。
} // 結束答案提交函式。

// 讓學生按下數字鍵一、二、三即可選擇題目答案。
function keyPressed() { // 定義鍵盤按下事件函式。
  if (questionVisible && key >= '1' && key <= '3') { // 如果題目顯示且按下有效的選項數字。
    submitAnswer(['10', '12', '13'][Number(key) - 1]); // 將數字鍵轉成對應的答案並提交。
    return false; // 避免瀏覽器將按鍵當成頁面快捷鍵。
  } // 結束數字鍵作答判斷。
  return true; // 保留其他按鍵的預設行為。
} // 結束鍵盤按下事件函式。

// 讓學生以滑鼠點擊畫面上的答案按鈕作答。
function mousePressed() { // 定義滑鼠按下事件函式。
  for (let index = 0; index < answerButtons.length; index += 1) { // 逐一檢查滑鼠是否點中答案按鈕。
    const button = answerButtons[index]; // 取得目前檢查的答案按鈕範圍。
    if (mouseX >= button.x && mouseX <= button.x + button.width && mouseY >= button.y && mouseY <= button.y + button.height) { // 如果滑鼠座標位於此按鈕內。
      submitAnswer(button.answer); // 提交被點擊按鈕所代表的答案。
      return; // 完成作答後結束滑鼠事件處理。
    } // 結束按鈕點擊判斷。
  } // 結束按鈕範圍檢查迴圈。
} // 結束滑鼠按下事件函式。

// 在瀏覽器視窗改變大小時同步調整畫布尺寸。
function windowResized() { // 定義視窗大小改變事件函式。
  resizeCanvas(windowWidth, windowHeight); // 將畫布調整成新的視窗大小。
} // 結束視窗大小改變事件函式。
