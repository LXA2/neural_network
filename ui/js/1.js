var matrix = [], matrix_false = [];
var data = [];
var mode = "train";
const matrix_width_and_height = 30;
for (let i = 0; i < matrix_width_and_height; i++) {
    var tmp_group = [];
    for (let i1 = 0; i1 < matrix_width_and_height; i1++) {
        tmp_group.push(false);
    }
    matrix.push(tmp_group);
    //matrix_false = matrix;
}

function getFormattedDate() {
    const date = new Date();
    const offset = -date.getTimezoneOffset() / 60; // 時區偏移
    const timezone = `UTC${offset >= 0 ? '+' : ''}${offset}`;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

    return `${timezone}_${year}_${month}_${day}_${hours}_${minutes}_${seconds}_${milliseconds}`;
}


matrix_false = JSON.parse(JSON.stringify(matrix));

const canvas = document.getElementsByTagName("canvas")[0];
const ctx = canvas.getContext('2d');
const canvas2 = document.getElementsByTagName("canvas")[1];
const ctx2 = canvas2.getContext('2d');

const undo_btn = document.getElementById("undo");


const windowWidth = () => { return window.innerWidth; };
const windowHeight = () => { return window.innerHeight; };
const windowWidth_initial = window.innerWidth;
const windowHeight_initial = window.innerHeight;
canvas.width = windowWidth() * 0.35;
canvas.height = windowWidth() * 0.35;
canvas2.width = windowWidth() * 0.35;
canvas2.height = windowWidth() * 0.35;
const border_width = 2;
canvas.style.border = `${border_width}px solid black`;


window.addEventListener('resize', () => {
    canvas.width = windowWidth() * 0.35;
    canvas.height = windowWidth() * 0.35;
    canvas2.width = windowWidth() * 0.35;
    canvas2.height = windowWidth() * 0.35;
    draw();
});

// touch
document.addEventListener('touchstart', start);
document.addEventListener('touchmove', move);
document.addEventListener('touchend', end);

// mouse
document.addEventListener('mousedown', start);
document.addEventListener('mousemove', move);
document.addEventListener('mouseup', end);
//canvas.addEventListener('mouseout', end);


var stack1 = [], stack = [];
var circumscribing_rectangle = { top: 0, bottom: 0, left: 0, right: 0 };
var writing = false;

function start(e) {
    const rect = canvas.getBoundingClientRect();
    // const x_min = rect.left + border_width + window.scrollX;
    // const x_max = rect.right - border_width + window.scrollX;
    // const y_min = rect.top + border_width + window.scrollY;
    // const y_max = rect.bottom - border_width + window.scrollY;
    const x_min = rect.left + border_width;
    const x_max = rect.right - border_width;
    const y_min = rect.top + border_width;
    const y_max = rect.bottom - border_width;
    const touch = e.touches ? e.touches[0] : null;
    var x = (touch ? touch.clientX : e.clientX);
    var y = (touch ? touch.clientY : e.clientY);
    if (x >= x_min && y >= y_min && x <= x_max && y <= y_max) {
        writing = true;
        if (stack1.length != 0) console.error("stack1 not empty");
        stack1 = [];
        stack1.push([x - x_min, y - y_min]);
        const magnification = matrix_width_and_height / (x_max - x_min);
        if (circumscribing_rectangle.left == 0 && circumscribing_rectangle.right == 0 && circumscribing_rectangle.bottom == 0 && circumscribing_rectangle.top == 0) {
            circumscribing_rectangle.top = (y - y_min) * magnification;
            circumscribing_rectangle.bottom = (y - y_min) * magnification;
            circumscribing_rectangle.left = (x - x_min) * magnification;
            circumscribing_rectangle.right = (x - x_min) * magnification;
        }
        stack.push([(x_max - x_min), stack1, circumscribing_rectangle]);
        stack1 = [];
        undo_btn.disabled = false;
        undo_btn.style.cursor = "";
    }
}

function move(e) {
    if (!writing) return;
    const rect = canvas.getBoundingClientRect();
    // const x_min = rect.left + border_width + window.scrollX;
    // const x_max = rect.right - border_width + window.scrollX;
    // const y_min = rect.top + border_width + window.scrollY;
    // const y_max = rect.bottom - border_width + window.scrollY;
    const x_min = rect.left + border_width;
    const x_max = rect.right - border_width;
    const y_min = rect.top + border_width;
    const y_max = rect.bottom - border_width;
    const touch = e.touches ? e.touches[0] : null;
    //console.log("E:", e);
    var x = (touch ? touch.clientX : e.clientX);
    var y = (touch ? touch.clientY : e.clientY);
    if (x < x_min) x = x_min;
    if (x > x_max) x = x_max;
    if (y < y_min) y = y_min;
    if (y > y_max) y = y_max;
    const magnification = matrix_width_and_height / Math.abs(x_max - x_min);
    if ((x - x_min) * magnification < circumscribing_rectangle.left) circumscribing_rectangle.left = (x - x_min) * magnification;
    if ((x - x_min) * magnification > circumscribing_rectangle.right) circumscribing_rectangle.right = (x - x_min) * magnification;
    if ((y - y_min) * magnification > circumscribing_rectangle.bottom) circumscribing_rectangle.bottom = (y - y_min) * magnification;
    if ((y - y_min) * magnification < circumscribing_rectangle.top) circumscribing_rectangle.top = (y - y_min) * magnification;
    //stack1.push([x - x_min, y - y_min]);
    stack[stack.length - 1][1].push([x - x_min, y - y_min]);
    stack[stack.length - 1][2] = circumscribing_rectangle;
    ctx.strokeStyle = "rgb(0,0,0)";
    ctx.lineCap = "round";
    ctx.lineWidth = (rect.right - rect.left) / 20;
    ctx.globalCompositeOperation = 'source-over';
    ctx.beginPath();
    ctx.moveTo(stack[stack.length - 1][1][stack[stack.length - 1][1].length - 2][0], stack[stack.length - 1][1][stack[stack.length - 1][1].length - 2][1]);
    ctx.lineTo(stack[stack.length - 1][1][stack[stack.length - 1][1].length - 1][0], stack[stack.length - 1][1][stack[stack.length - 1][1].length - 1][1]);
    ctx.stroke();
    grid();
}

function end(e) {
    if (!writing) return;
    const rect = canvas.getBoundingClientRect();
    // const x_min = rect.left + border_width + window.scrollX;
    // const x_max = rect.right - border_width + window.scrollX;
    // const y_min = rect.top + border_width + window.scrollY;
    // const y_max = rect.bottom - border_width + window.scrollY;
    const x_min = rect.left + border_width;
    const x_max = rect.right - border_width;
    const y_min = rect.top + border_width;
    const y_max = rect.bottom - border_width;
    const touch = e.touches ? e.touches[0] : null;
    var x = (touch ? touch.clientX : e.clientX);
    var y = (touch ? touch.clientY : e.clientY);
    if (x < x_min) x = x_min;
    if (x > x_max) x = x_max;
    if (y < y_min) y = y_min;
    if (y > y_max) y = y_max;
    const magnification = matrix_width_and_height / Math.abs(x_max - x_min);
    if ((x - x_min) * magnification < circumscribing_rectangle.left) circumscribing_rectangle.left = (x - x_min) * magnification;
    if ((x - x_min) * magnification > circumscribing_rectangle.right) circumscribing_rectangle.right = (x - x_min) * magnification;
    if ((y - y_min) * magnification > circumscribing_rectangle.bottom) circumscribing_rectangle.bottom = (y - y_min) * magnification;
    if ((y - y_min) * magnification < circumscribing_rectangle.top) circumscribing_rectangle.top = (y - y_min) * magnification;
    stack[stack.length - 1][1].push([x - x_min, y - y_min]);
    stack[stack.length - 1][2] = circumscribing_rectangle;
    ctx.strokeStyle = "rgb(0,0,0)";
    ctx.lineCap = "round";
    ctx.lineWidth = (rect.right - rect.left) / 20;
    ctx.globalCompositeOperation = 'source-over';
    ctx.beginPath();
    ctx.moveTo(stack[stack.length - 1][1][stack[stack.length - 1][1].length - 2][0], stack[stack.length - 1][1][stack[stack.length - 1][1].length - 2][1]);
    ctx.lineTo(stack[stack.length - 1][1][stack[stack.length - 1][1].length - 1][0], stack[stack.length - 1][1][stack[stack.length - 1][1].length - 1][1]);
    ctx.stroke();
    writing = false;
    grid();
}

function draw() {
    const rect = canvas.getBoundingClientRect();
    // const x_min = rect.left + border_width + window.scrollX;
    // const x_max = rect.right - border_width + window.scrollX;
    // const y_min = rect.top + border_width + window.scrollY;
    // const y_max = rect.bottom - border_width + window.scrollY;
    const x_min = rect.left + border_width;
    const x_max = rect.right - border_width;
    const y_min = rect.top + border_width;
    const y_max = rect.bottom - border_width;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < stack.length; i++) {
        ctx.strokeStyle = "rgb(0,0,0)";
        ctx.lineCap = "round";
        ctx.lineWidth = (rect.right - rect.left) / 20;
        ctx.globalCompositeOperation = 'source-over';
        magnification = (x_max - x_min) / stack[i][0];
        if (stack[i][1].length == 1) {
            ctx.beginPath();
            ctx.moveTo(stack[i][1][0][0] * magnification, stack[i][1][0][1] * magnification);
            ctx.lineTo(stack[i][1][0][0] * magnification, stack[i][1][0][1] * magnification);
            ctx.stroke();
        }
        for (let j = 1; j < stack[i][1].length; j++) {
            ctx.beginPath();
            ctx.moveTo(stack[i][1][j - 1][0] * magnification, stack[i][1][j - 1][1] * magnification);
            ctx.lineTo(stack[i][1][j][0] * magnification, stack[i][1][j][1] * magnification);
            ctx.stroke();
        }
    }
}

function clear_canvas() {
    for (let i1 = 0; i1 < matrix_width_and_height; i1++) {
        for (let i2 = 0; i2 < matrix_width_and_height; i2++) {
            matrix[i1][i2] = false;
        }
    }
    undo_btn.disabled = true;
    undo_btn.style.cursor = "not-allowed";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    circumscribing_rectangle = { top: 0, bottom: 0, left: 0, right: 0 };
    stack1 = [];
    stack = [];
    const rect2 = canvas2.getBoundingClientRect();
    ctx2.clearRect(0, 0, rect2.right, rect2.bottom);
}

function undo() {
    //console.log("clear");
    if (stack.length == 1) {
        undo_btn.disabled = true;
        undo_btn.style.cursor = "not-allowed";
    }
    if (stack.length > 0) {
        circumscribing_rectangle = stack.pop()[2];
        draw();
        grid();
    }
}

function grid() {
    //side_length = matrix_width_and_height - 2;
    const rect = canvas2.getBoundingClientRect();
    var side, magnification_to_canvas = 1;
    var basepoint = [circumscribing_rectangle.left, circumscribing_rectangle.top];
    var tmp_width = Math.abs((circumscribing_rectangle.left - 2) - (circumscribing_rectangle.right + 2));
    var tmp_height = Math.abs((circumscribing_rectangle.bottom + 2) - (circumscribing_rectangle.top - 2));
    if (tmp_width > tmp_height) {
        basepoint[1] -= Math.abs(tmp_width - tmp_height) / 2;
        magnification_to_canvas = Math.abs(rect.right - rect.left) / matrix_width_and_height;
        side = tmp_width;
    } else if (tmp_width <= tmp_height) {
        basepoint[0] -= Math.abs(tmp_height - tmp_width) / 2;
        magnification_to_canvas = Math.abs(rect.right - rect.left) / matrix_width_and_height;
        side = tmp_height;
    }
    basepoint[0] -= 2;
    basepoint[1] -= 2;
    for (let i1 = 0; i1 < matrix_width_and_height; i1++) {
        for (let i2 = 0; i2 < matrix_width_and_height; i2++) {
            matrix[i1][i2] = false;
        }
    }
    ctx2.clearRect(0, 0, rect.right, rect.bottom);
    for (let i = 0; i < stack.length; i++) {
        //console.log(stack[i][1][0][1]);
        var tmp_y0 = (stack[i][1][0][1] * (matrix_width_and_height / stack[i][0]) - basepoint[1]) * (matrix_width_and_height / side);
        var tmp_x0 = (stack[i][1][0][0] * (matrix_width_and_height / stack[i][0]) - basepoint[0]) * (matrix_width_and_height / side);
        if (tmp_y0 == matrix_width_and_height) { tmp_y0--; }
        if (tmp_x0 == matrix_width_and_height) { tmp_x0--; }
        last_point = [Math.floor(tmp_x0), Math.floor(tmp_y0)];

        for (let j = 1; j < stack[i][1].length; j++) {
            var tmp_y = (stack[i][1][j][1] * (matrix_width_and_height / stack[i][0]) - basepoint[1]) * (matrix_width_and_height / side);
            var tmp_x = (stack[i][1][j][0] * (matrix_width_and_height / stack[i][0]) - basepoint[0]) * (matrix_width_and_height / side);
            if (tmp_y == matrix_width_and_height) { tmp_y--; }
            if (tmp_x == matrix_width_and_height) { tmp_x--; }
            tmp_x = Math.floor(tmp_x);
            tmp_y = Math.floor(tmp_y);
            matrix[tmp_x][tmp_y] = true;
            /*
            var distance = Math.sqrt(Math.pow(tmp_x - last_point[0],2) + Math.pow(last_point[1] - tmp_y,2));
            var distance0 = distance;
            //console.log("distance:",distance);
            while (distance > 1) {
                var alpha = Math.atan(Math.abs(tmp_y - last_point[1]) / Math.abs(tmp_x - last_point[0]));
                var tmp_x2 = Math.floor(tmp_x > last_point[0] ? tmp_x - (1 + (distance0 - distance)) * Math.cos(alpha): last_point[0] - (1 + (distance0 - distance)) * Math.cos(alpha));
                var tmp_y2 = Math.floor(tmp_y > last_point[1] ? tmp_y - (1 + (distance0 - distance)) * Math.sin(alpha): last_point[1] - (1 + (distance0 - distance)) * Math.sin(alpha));
                matrix[tmp_x2][tmp_y2] = true;
                tmp_x2 *= magnification_to_canvas;
                tmp_y2 *= magnification_to_canvas;
                ctx2.fillStyle = "#ff0000";
                ctx2.fillRect(tmp_x2,tmp_y2,Math.abs(rect.right - rect.left)/matrix_width_and_height,Math.abs(rect.right - rect.left)/matrix_width_and_height);
                distance -= 1;
                console.log("point insered");
            }*/

            var distance = Math.sqrt(Math.pow(tmp_x - last_point[0], 2) + Math.pow(last_point[1] - tmp_y, 2));
            var dx = tmp_x - last_point[0];
            var dy = tmp_y - last_point[1];
            var steps = Math.ceil(distance);
            var step_x = dx / steps;
            var step_y = dy / steps;

            for (var i1 = 1; i1 < steps; i1++) {
                var tmp_x2 = Math.floor(last_point[0] + step_x * i1);
                var tmp_y2 = Math.floor(last_point[1] + step_y * i1);
                matrix[tmp_x2][tmp_y2] = true;
                //ctx2.fillStyle = "#ff0000";
                ctx2.fillRect(
                    tmp_x2 * magnification_to_canvas,
                    tmp_y2 * magnification_to_canvas,
                    Math.abs(rect.right - rect.left) / matrix_width_and_height,
                    Math.abs(rect.right - rect.left) / matrix_width_and_height
                );
            }

            last_point = [tmp_x, tmp_y];
            tmp_x *= magnification_to_canvas;
            tmp_y *= magnification_to_canvas;
            //ctx2.fillStyle = "#000000";
            ctx2.fillRect(tmp_x, tmp_y, Math.abs(rect.right - rect.left) / matrix_width_and_height, Math.abs(rect.right - rect.left) / matrix_width_and_height);

        }
    }
}

function ccchmode(tar) {
    if (mode != tar) {
        if (confirm("清除数据?")) {
            data = [];
            document.getElementById("data_num").innerText = `數據組數:${0}`;
            document.getElementById("data").innerText += "";
        }
    }
    mode = tar;
}

function ccconfirm() {
    const radios = document.getElementsByName('n');
    let selectedValue;
    for (const radio of radios) {
        if (radio.checked) {
            selectedValue = radio.value;
            break;
        }
    }
    
    
    data.push({ "no": selectedValue, "name": document.getElementById(`text${selectedValue}`).value, "matrix": JSON.parse(JSON.stringify(matrix)) });
    
    document.getElementById("data_num").innerText = `數據組數:${data.length}`;
    document.getElementById("data").innerText += `\n(${selectedValue})${document.getElementById(`text${selectedValue}`).value}`;
    
    clear_canvas();
}

document.getElementById('downloadBtn').addEventListener('click', function () {
    var content = "";
    content += `${mode},${data.length}\n`;
    for (let i = 0; i < data.length; i++) {
        if (mode == "train") content += `${data[i].no},${document.getElementById(`text${data[i].no}`).value}\n`;
        for (let j = 0; j < matrix_width_and_height; j++) {
            content += `${data[i].matrix[0][j] ? 1 : 0}`;
            for (let k = 1; k < matrix_width_and_height; k++) {
                content += `,${data[i].matrix[k][j] ? 1 : 0}`;//此处输出的矩阵经过了转置
            }
            content += "\n";
        }
    }
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mode}_${getFormattedDate()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

document.addEventListener('keydown', function(event) {
    writing = false;
    if (event.key === 'Enter') {
        ccconfirm();
    }
});