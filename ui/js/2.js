document.getElementById("add_input").addEventListener("click",function(){
    input_types++;
    change_input_area();
});

document.getElementById("subtract_input").addEventListener("click",function(){
    if (input_types > 1){
        input_types--;
        change_input_area();
    }
});

function change_input_area(){
    let haha = document.getElementById("input_area");
    haha.innerHTML = `<span class="radio_choice"><input type="radio" name="n" value="1" checked="true"><div><input type="text" id="text1" placeholder="未命名1"></div></span>`;
    for (let i = 2; i <= input_types; i++) {
        haha.innerHTML+=`<span class="radio_choice"><input type="radio" name="n" value="${i}"><div><input type="text" id="text${i}" placeholder="未命名${i}"></div></span>`;
    }
}