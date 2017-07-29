/*
MIT License

Copyright (c) 2017 tj

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

function createElement(tag,className,val){
    var el = document.createElement(tag);
    className = className || "";
    className = className.split(" ");
    for(var i = 0;i<className.length;i++){
        if(!className[i]){
            continue;
        }
        el.classList.add(className[i]);
    }
    el.innerHTML = htmlEncode(val||"");
    return el;
}

function createTextElement(tag,className,val){
    var el = document.createTextNode(tag);
    el.class = className;
    el.innerHTML = htmlEncode(val||"");
    return el;
}

function collapser (collapsed) {
    var span = createElement("span","collapser");
    span.addEventListener("click", function(e){
        var me = e.target;
        me.classList.toggle("collapsed");
        var parent = me.parentNode;
        var block = null;
        for (var i = 0; i < parent.childNodes.length; i++) {
            var el = parent.childNodes[i];
            if (el.classList && el.classList.contains("block")) {
                block = parent.childNodes[i];
                break;
            }
        }

        var ul = block.getElementsByTagName("ul")[0];
        if (me.classList.contains("collapsed")) {
            ul.style.display = "none";
            if(block){
                for (var i = 0; i < block.childNodes.length; i++) {
                    if (block.childNodes[i].classList.contains("dots") || block.childNodes[i].classList.contains("comments")) {
                        block.childNodes[i].style.display = "inline";
                    }
                }
            }
        } else {
            ul.style.display = "block";
            if(block){
                for (var i = 0; i < block.childNodes.length; i++) {
                    if (block.childNodes[i].classList.contains("dots") || block.childNodes[i].classList.contains("comments")) {
                        block.childNodes[i].style.display = "none";
                    }
                }
            }
        }
    });

    if (collapsed) {
        span.classList.add("collapsed");
    }
    return span;
};

function htmlEncode (html){
    if (!html.toString()) {
        return "";
    }
    return html.toString().replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function getType(obj){
    return {}.toString.call(obj).split(" ")[1].slice(0, -1).toLowerCase();
}

function isEmpty(obj){
    if(Array.isArray(obj)){
        return obj.length == 0;
    }
    return Object.keys(obj).length === 0 && obj.constructor === Object;
}

function genObjOrArrayBlock(isObj,val,level){
    var openBlock = isObj ? "{" : "[";
    var closeBlock = isObj ? "}" : "]";

    if (!level) {
        level = 0;
    }

    var output = createElement("span","block");

    var cnt = Object.keys(val).length;
    output.appendChild(createElement("span","b",openBlock));

    if (!cnt) {
        var s = document.createTextNode(" ");
        output.appendChild(s);
        output.appendChild(createElement("span","b",closeBlock));
        return output;
    }

    var items = createElement("ul","obj collapsible level" + level)
    var keys = Object.keys(val);

    for(var i = 0;i<keys.length;i++){
        cnt--;
        var item = createElement("li");
        if (["object", "array"].indexOf(getType(val[keys[i]])) !== -1 && !isEmpty(val[keys[i]])) {
            item.appendChild(collapser());
        }
        item.appendChild(createElement("span","q","\""));
        item.appendChild(createTextElement(keys[i]));
        item.appendChild(createElement("span","q","\""));
        item.appendChild(createTextElement(": "));
        item.appendChild(genBlock(val[keys[i]],level+1));

        if (cnt > 0) {
            item.appendChild(createTextElement(","));
        }

        items.appendChild(item);
    }

    output.appendChild(items);
    output.appendChild(createElement("span","dots","..."));
    output.appendChild(createElement("span","b",closeBlock));

    if (Object.keys(val).length === 1) {
        output.appendChild(createElement("span","comments","// 1 item"));
    } else {
        output.appendChild(createElement("span","comments","// "+Object.keys(val).length+" items"));
    }

    return output;
}

function genBlock (val, level){

    var typeName = getType(val);

    switch(typeName){
        case "object":
            return genObjOrArrayBlock(true,val,level);
        case "array":
            return genObjOrArrayBlock(false,val,level);;
        case "string":

            var span = createElement("span");
            span.appendChild(createElement("span","q","\""));
            val = htmlEncode(val);
            if (/^(http|https|file):\/\/[^\s]+$/i.test(val)) {
                var a = createElement("a");
                a.href = val;
                a.innerHTML = val;
                span.appendChild(a);
                span.appendChild(createElement("span","q","\""));
                return span;
            }

            var newline_regex = /\n/g;
            var tagName = newline_regex.test(val) ? "pre":"span";

            var text = createElement(tagName,"str",val);
            span.appendChild(text);
            span.appendChild(createElement("span","q","\""));
            return span;
        case "number":
            return createElement("span","num",val.toString());
        case "undefined":
            return createElement("span","undef","undefined");
        case "null":
            return createElement("span","null","null");
        case "boolean":
            return createElement("span","bool",val.toString());
    }
}

function formatter(json) {
    return genBlock(json);
};

function addJsonViewer(root, json){

    if (typeof json === "string") {
        try {
            json = JSON.parse(json);
        } catch (err) {
            console.log(err);
            return;
        }
    }

    var div = createElement("div","json-view");
    root.appendChild(div);
    div.appendChild(formatter(json));
};
