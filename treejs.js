

let currentRow;
var wbs = {};
var wbs_with_breaks={'primary':wbs};
var tempActivity = 200;
var max_childs = 0;
var max_cell_in_row = 0;
var level = 0;
var objects_in_level = {};
var subsystems_in_level = {};
var gbl_curr_row;
var currId = 0;
var sub_system_data_to_tree = [];
var testData = [];
var targetRow="";

var color_array=["--", "yellow", "orange", "lightgreen"]
var status_options=["-Status-", "Proposed", "In-Process", "Completed"];

$(document).ready(function () {
    addFirstRow();
});
function indentRow(){
   
    let new_parent;
    let pos = subsystems_in_level[wbs[currentRow.id]['level']].indexOf(parseInt(currentRow.id));
   
    if(subsystems_in_level[wbs[currentRow.id]['level']][pos-1] != undefined){
        new_parent=subsystems_in_level[wbs[currentRow.id]['level']][pos-1];
    }
    var array =subsystems_in_level[wbs[currentRow.id]['level']];
    array.splice(subsystems_in_level[wbs[currentRow.id]['level']].indexOf(parseInt(currentRow.id)), 1);
    subsystems_in_level[wbs[currentRow.id]['level']]=array;
    
    if(subsystems_in_level[wbs[currentRow.id]['level']+1] == undefined){
        subsystems_in_level[wbs[currentRow.id]['level']+1]=[];
    }
    subsystems_in_level[wbs[currentRow.id]['level']+1].push(parseInt(currentRow.id));

    wbs[currentRow.id]['level']+=1;
    wbs[currentRow.id]['parent'] = new_parent;    

    wbs[new_parent]['childrens'].push(parseInt(currentRow.id));
    

    let left_pad = parseInt(currentRow.cells[1].style.paddingLeft);
    if (left_pad != NaN && left_pad > 0) {
            currentRow.cells[1].innerHTML = "<i class='fa fa-child'></i>&nbspChild";
            currentRow.cells[1].style.paddingLeft = (left_pad + 20) + "px";
    }
    else {
        currentRow.cells[1].innerHTML = "<i class='fa fa-child'></i>&nbspParent";
        currentRow.cells[1].style.paddingLeft = "20px";
    }
    for(var t in testData){
         if(testData[t]['id'] == currentRow.id){
            testData[t]['name'] = wbs[currentRow.id]['Name'];
            testData[t]['parent'] = wbs[currentRow.id]['parent'];
         }
    }
    saveWBS();

}
var abc = [];
function returnSuccessorChildrens(id) {
   
    if (wbs[id]['active'] == 0) {
        if (wbs[id]['childrens'].length == 0) {
            abc.push(parseInt(id));
        }
        for (var i in wbs[id]['childrens']) {
            abc.push(parseInt(id));
            returnSuccessorChildrens(wbs[id]['childrens'][i]);
        }
    }
    const uniqueArray = abc.filter((value, index, self) => self.indexOf(value) === index);
    return uniqueArray;
}
function breakWBS(){
    abc = [];
    var ele_list=returnSuccessorChildrens(currentRow.id);
    let temp_obj = {};
    for(let i in ele_list){
        temp_obj[ele_list[i]] = wbs[ele_list[i]];
       
        
        if(i==0){
            temp_obj[ele_list[i]]['level'] = 1;
        }else {
            temp_obj[ele_list[i]]['level'] = temp_obj[ele_list[i]]['level']-wbs[ele_list[0]]['level'];
        }   
    }
    wbs_with_breaks[ele_list[0]] = temp_obj;

    currentRow.cells[2].style.paddingLeft =10+"px"; 
    
}

function addFirstRow() {
    const table = document.getElementById('wbs');

    const newRow = table.insertRow(1);
    const newCell0 = newRow.insertCell(0);
    const newCell1 = newRow.insertCell(1);
    const newCell2 = newRow.insertCell(2);
    const newCell3 = newRow.insertCell(3);
    newCell0.innerText = "1";
    newCell1.innerText = "1";
    newCell2.innerText = "Main Project "//"Child " + tempActivity;
    newCell3.innerText = "None";
    newCell0.classList.add("td-activity");
    newCell1.classList.add("td-activity");
    newCell2.classList.add("td-activity");
    newCell3.classList.add("td-activity");


    newRow.setAttribute("id", "1");



    var temp = {};
    temp['ID'] = 1;
    temp['Name'] = "Main Project ";
    temp['level'] = 1;
    temp['parent'] = 0;
    temp['childrens'] = [];
    temp['active'] = 0;
    temp['module'] = 0;
    wbs[1] = temp;
    testData.push({ id: temp['ID'], name: temp['Name'], parent: temp['parent'], active:temp['active'], module:temp['module'], level:temp['level'] });

    objects_in_level[1] = 1;
    subsystems_in_level[1] = [1];
    saveWBS();
}


document.addEventListener('DOMContentLoaded', () => {
    const table = document.getElementById('wbs');
    const contextMenu = document.getElementById('contextMenu');
    table.addEventListener('contextmenu', function (event) {
        event.preventDefault();
        const targetRow = event.target.closest('tr');
        if (targetRow && targetRow.rowIndex > 0) {  // Skip the header row
            currentRow = targetRow;
            showContextMenu(event.clientX, event.clientY);
        }
    });

    table.addEventListener('dblclick', function () {
        targetRow = event.target.closest('tr');
        //currId = targetRow.id;

        if (targetRow && targetRow.rowIndex > 1) {  // Skip the header row
            gbl_curr_row = targetRow;
            editRowInline(targetRow);
        }
        

        contextMenu.style.display = 'None';

    });

    table.addEventListener('click', function (event) {
        currId = event.target.closest('tr');
     
 
        if (parseInt(targetRow.id) != parseInt(currId.id) && targetRow != undefined ) {
           // alert(targetRow.id);
            saveRow(targetRow);
        }
        contextMenu.style.display = 'None';
    });

    document.addEventListener('click', function (event) {
        contextMenu.style.display = 'None';
    });

    function showContextMenu(x, y) {
        contextMenu.style.left = x + "px";
        contextMenu.style.top = y + "px";
        contextMenu.style.display = 'block';
    }
});

function totalchilds(id) {
    return wbs[id]['childrens'].length;
}
function getChildrens(id) {
    var sum = 0;
    if (wbs[id]['childrens'].length == 0) {
        return 0;
    }
    else {
        for (var i in wbs[id]['childrens']) {
            sum += totalchilds(id);
        }
        return sum;
    }
}

function addChild(identifier) {
    const table = document.getElementById('wbs');
    var temp = {};
    if (objects_in_level[wbs[currentRow.id]['level'] + 1] == undefined) {
        objects_in_level[wbs[currentRow.id]['level'] + 1] = 0;
        subsystems_in_level[wbs[currentRow.id]['level'] + 1] = [];
    }

  
        var count = 0;
        count = returnSuccessorCount(currentRow.id);
        const newRow = table.insertRow(currentRow.rowIndex + (count - 1) + 1);
        const newCell0 = newRow.insertCell(0);
        const newCell1 = newRow.insertCell(1);
        const newCell2 = newRow.insertCell(2);
        const newCell3 = newRow.insertCell(3);
        newCell0.innerText = tempActivity;
        newCell1.innerText = "Sub-System";
        newCell2.innerText = "Sub-System " + tempActivity;
        newCell3.innerText = "None"//"Status " + tempActivity;
        newCell0.classList.add("td-activity");
        newCell1.classList.add("td-activity");
        newCell2.classList.add("td-activity");
        newCell3.classList.add("td-activity");

        let left_pad = parseInt(currentRow.cells[1].style.paddingLeft);
        if (left_pad != NaN && left_pad > 0) {
            newCell1.innerHTML = "<i class='fa fa-child'></i>&nbspChild";
            newCell1.style.paddingLeft = (left_pad + 20) + "px";
        }
        else {
            newCell1.innerHTML = "<i class='fa fa-child'></i>&nbspParent";
            newCell1.style.paddingLeft = "20px";
        }
        newRow.setAttribute("id", tempActivity);
        var local_temp = wbs[currentRow.id];
        (local_temp['childrens']).push(tempActivity);
        temp['ID'] = tempActivity;
        temp['level'] = wbs[currentRow.id]['level'] + 1;
        temp['parent'] = currentRow.id;
        temp['childrens'] = [];
        temp['active'] = 0;
        temp['module'] = 0;
        temp['Name'] = "Sub-System" + tempActivity;
        wbs[tempActivity] = temp;
        tempActivity++;

        objects_in_level[wbs[currentRow.id]['level'] + 1] = (objects_in_level[wbs[currentRow.id]['level'] + 1]) + 1;
        (subsystems_in_level[wbs[currentRow.id]['level'] + 1]).push(temp['ID']);
        var temp2 = {};
       
        temp2['id'] = temp['ID'];
        temp2['name'] = temp['Name'];
        temp2['parent'] = temp['parent'];
        temp2['level'] = wbs[currentRow.id]['level'] + 1;
        temp2['module'] = 0;
        temp2['active'] = 0;
        testData.push(temp2);
    
    tempActivity++;
    saveWBS();
    hideContextMenu();
}

function editRow() {
    editRowInline(currentRow);
    hideContextMenu();
}

function deleteRow() {
    if (wbs[currentRow.id]['childrens'].length == 0) {
        if (confirm("Do you want to delete ?")) {
            var array = wbs[wbs[currentRow.id]['parent']]['childrens'];
            var indexToDelete = array.indexOf(parseInt(currentRow.id));
            if (indexToDelete >= 0 && indexToDelete < array.length) {
                array.splice(indexToDelete, 1);
                wbs[wbs[currentRow.id]['parent']]['childrens'] = array;
            }
            var data = testData.filter(a=>a.id==currentRow.id);
            data[0].active=1;
            currentRow.remove();
            hideContextMenu();
        }
    }
    else if (wbs[currentRow.id]['childrens'].length > 0) {
        alert("You cant delete parent directly please delete childs first");
    }
    saveWBS();
}

function hideContextMenu() {
    const contextMenu = document.getElementById('contextMenu');
    contextMenu.style.display = 'None';
}

function editRowInline(row) {
    let temp = 0;

    for(let r in status_options){
        if(row.cells[3].innerText == status_options[r]){
            temp = r;
        }
    }
    row.cells[2].innerHTML = "<input type='text' value='" + row.cells[2].innerText + "' id='systemName" + row.id + "'>";
    row.cells[3].innerHTML = "<select id='SystemStatus" + row.id + "'><option value='0' style='background-color: "+color_array[0]+"'>-Status-</option><option value='1' style='background-color: "+color_array[1]+"'>Proposed</option><option value='2' style='background-color: "+color_array[2]+"'>In-Process</option><option value='3' style='background-color: "+color_array[3]+"'>Completed</option></select>";
    document.getElementById("SystemStatus" + row.id).value = temp;
}

function saveRow(row) {
  
    var temp = {};
   
    temp = wbs[row.id];
    temp['Name'] = document.getElementById("systemName" + row.id).value;
    temp['module'] =document.getElementById("SystemStatus" + row.id).value;
    wbs[row.id] = temp;
    
    for(var t in testData){
        if(testData[t].id == parseInt(row.id)){
            testData[t].name = document.getElementById("systemName" + row.id).value;
            testData[t].module = document.getElementById("SystemStatus" + row.id).value;
        }
    }
    row.cells[2].innerText = document.getElementById("systemName" + row.id).value;
    row.cells[3].innerText = status_options[document.getElementById("SystemStatus" + row.id).value];
    saveWBS();

}
function saveWBS() {

    var b = drawList(1);
    //$("#parent_chart").html(b);
    let data_avoid_deleted=testData.filter(a => a.active == 0);
    $(function () {
        org_chart = $('#orgChart').orgChart({
            data: data_avoid_deleted,
            showControls: false,
            allowEdit: false,
            onAddNode: function (node) {
                log('Created new node on node ' + node.data.id);
                org_chart.newNode(node.data.id);
            },
            onDeleteNode: function (node) {
                log('Deleted node ' + node.data.id);
                org_chart.deleteNode(node.data.id);
            },
            onClickNode: function (node) {
                log('Clicked node ' + node.data.id);
            }

        });
    });

    // just for example purpose
    function log(text) {
        //$('#consoleOutput').append('<p>' + text + '</p>')
    }

}

function returnSuccessorCount(id) {
    if (wbs[id]['active'] == 0) {
        if (wbs[id]['childrens'].length == 0) {
            return 1;
        }
        var count = 0;
        for (var i in wbs[id]['childrens']) {
            count = count + returnSuccessorCount(wbs[id]['childrens'][i]);
        }
    }
    return count + 1;
}

function drawList(id) {
    if (parseInt(wbs[id]['active']) == 0) {
        if (wbs[id]['childrens'].length === 0) {
            return "<ul><li>" + id + "</li></ul>";
        }
        var b = "<ul><li>" + id;
        for (var i in wbs[id]['childrens']) {
            b += drawList(wbs[id]['childrens'][i]);
        }
        b += "</li></ul>";
    }
    return b;
}
function outdentRow() {
    var left_pad = parseInt(currentRow.cells[1].style.paddingLeft);
    if (left_pad != NaN && left_pad > 0) {
        currentRow.cells[1].innerText = "";
        currentRow.cells[1].style.paddingLeft = (left_pad - 20) + "px";
        left_pad = left_pad - 20;
        if (parseInt(currentRow.cells[1].style.paddingLeft) > 0) {
            currentRow.cells[1].innerHTML = "<i class='fa fa-arrow-right'></i>&nbspParent";
        }
        else {
            currentRow.cells[1].innerHTML = "&nbspParent";
        }
    }
    else {
        alert("Outdent validation");
    }
}

// function indentRow() {
//     var left_pad = parseInt(currentRow.cells[1].style.paddingLeft);
//     if (left_pad != NaN && left_pad > 0) {
//         currentRow.cells[1].innerText = "";
//         currentRow.cells[1].style.paddingLeft = (left_pad + 20) + "px";
//         if (left_pad > 0) {
//             currentRow.cells[1].innerHTML = "<i class='fa fa-arrow-right'></i>&nbspParent";
//         }
//     }
//     else {
//         alert("Outdent validation");
//     }
// }
function printWBS(){
    let test_data = testData.filter(a => a.active==0);
    let html_table ="<span style='font-weight: 600; font-size: 16px;'>WBS Sub-System List: </span>";
    html_table +="<table width='100%' style='border-collapse: collapse;'><thead><tr style='background-color:lightgray;'><td style='border:1px solid black'>SR No</td><td style='border:1px solid black'>Title</td><td style='border:1px solid black'>Status</td></tr></thead><tbody>";
        for(let g in test_data){
            html_table +="<tr><td style='border:1px solid black'> "+parseInt(parseInt(g)+1)+"</td><td style='border:1px solid black'> "+test_data[g].name+"</td><td style='border:1px solid black'> "+status_options[test_data[g].module]+"</td></tr>";

        }

    html_table +="</tbody></table>";

    let style="div.orgChart {margin : 10px;padding : 20px;      }"+
      
      "div.orgChart h2 {margin : 0px;font-size : 16px;font-weight: normal;min-height: 20px;}"+
      
      "div.orgChart ul {list-style : none;margin : 4px;padding : 0px;font-size : 0.8em;text-align : left;}"+
      
      "div.orgChart ul.stack,div.orgChart ul.stack ul { text-align : center; }"+
      
      "div.orgChart table { width : 100%; }"+
      
      "div.orgChart tr.lines td.line {width : 1px;height : 20px;}"+
      
      "div.orgChart tr.lines td.top { border-top : 1px inset black; }"+
      
      "div.orgChart tr.lines td.left { border-right : 1px inset black; }"+
      
      "div.orgChart tr.lines td.right { border-left : 0px inset black; }"+
      
      "div.orgChart tr.lines td.half { width : 50%; }"+
      
      "div.orgChart td {text-align : center;vertical-align : top;padding : 0px 2px;}"+
      
      "div.orgChart div.node {cursor : default;border : 1px solid #e7e7e7;display : inline-block;padding : 5px;width : 96px;background: #ffffff; background: -moz-linear-gradient(top, #ffffff 0%, #fbfbfb 100%); background: -webkit-gradient(linear, left top, left bottom, color-stop(0%, #ffffff), color-stop(100%, #fbfbfb));background: -webkit-linear-gradient(top, #ffffff 0%, #fbfbfb 100%); background: -o-linear-gradient(top, #ffffff 0%, #fbfbfb 100%);  background: -ms-linear-gradient(top, #ffffff 0%, #fbfbfb 100%); background: linear-gradient(to bottom, #ffffff 0%, #fbfbfb 100%); line-height : 1.3em;border-radius : 4px;-moz-border-radius : 4px;-webkit-border-radius : 4px;position: relative;box-shadow: 1px 1px 0px #ddd;}";
    var divContents = document.getElementById("orgChartContainer").innerHTML;
    var a = window.open('', '', 'height=900, width=1200');
    a.document.write('<html>');
    a.document.write('<head><style>'+style+'</style>');
    a.document.write('<body >');
   
    a.document.write(" <a class='navbar-brand' style='font-weight: 600; color:rgb(192, 47, 192); font-size: 30px;'>WBS (Work Breakdown Structure)</a>");
    a.document.write("<hr style='border: 1px inset black;'/>");
    a.document.write(html_table);
    a.document.write("<hr style='border: 1px inset black;'/>");
    a.document.write(divContents);
    a.document.write('</body></html>');
    a.print();
    a.document.close();
}


// --------------------------------------------------
//  Tree Logic
(function($) {
    $.fn.orgChart = function(options) {
        var opts = $.extend({}, $.fn.orgChart.defaults, options);
        return new OrgChart($(this), opts);        
    }

    $.fn.orgChart.defaults = {
        data: [{id:1, name:'Root', parent: 0}],
        showControls: false,
        allowEdit: false,
        onAddNode: null,
        onDeleteNode: null,
        onClickNode: null,
        newNodeText: 'Add Child'
    };

    function OrgChart($container, opts){
        var data = opts.data;
        var nodes = {};
        var rootNodes = [];
        this.opts = opts;
        this.$container = $container;
        var self = this;

        this.draw = function(){
            $container.empty().append(rootNodes[0].render(opts));
            $container.find('.node').click(function(){
                if(self.opts.onClickNode !== null){
                    self.opts.onClickNode(nodes[$(this).attr('node-id')]);
                }
            });

            if(opts.allowEdit){
                $container.find('.node h2').click(function(e){
                    var thisId = $(this).parent().attr('node-id');
                    self.startEdit(thisId);
                    e.stopPropagation();
                });
            }

           
        }

        this.startEdit = function(id){
            var inputElement = $('<input class="org-input" type="text" value="'+nodes[id].data.name+'"/>');
            $container.find('div[node-id='+id+'] h2').replaceWith(inputElement);
            var commitChange = function(){
                var h2Element = $('<h2>'+nodes[id].data.name+'</h2>');
                if(opts.allowEdit){
                    h2Element.click(function(){
                        self.startEdit(id);
                    })
                }
                inputElement.replaceWith(h2Element);
            }  
            inputElement.focus();
            inputElement.keyup(function(event){
                if(event.which == 13){
                    commitChange();
                }
                else{
                    nodes[id].data.name = inputElement.val();
                }
            });
            inputElement.blur(function(event){
                commitChange();
            })
        }

        this.newNode = function(parentId){
            var nextId = Object.keys(nodes).length;
            while(nextId in nodes){
                nextId++;
            }

            self.addNode({id: nextId, name: '', parent: parentId});
        }

        this.addNode = function(data){
            var newNode = new Node(data);
            nodes[data.id] = newNode;
            nodes[data.parent].addChild(newNode);

            self.draw();
            self.startEdit(data.id);
        }

        this.deleteNode = function(id){
            for(var i=0;i<nodes[id].children.length;i++){
                self.deleteNode(nodes[id].children[i].data.id);
            }
            nodes[nodes[id].data.parent].removeChild(id);
            delete nodes[id];
            self.draw();
        }

        this.getData = function(){
            var outData = [];
            for(var i in nodes){
                outData.push(nodes[i].data);
            }
            return outData;
        }

        // constructor
        for(var i in data){
            var node = new Node(data[i]);
            nodes[data[i].id] = node;
        }

        // generate parent child tree
        for(var i in nodes){
            if(nodes[i].data.parent == 0){
                rootNodes.push(nodes[i]);
            }
            else{
                nodes[nodes[i].data.parent].addChild(nodes[i]);
            }
        }

        // draw org chart
        $container.addClass('orgChart');
        self.draw();
    }

    function Node(data){
        this.data = data;
        this.children = [];
        var self = this;

        this.addChild = function(childNode){
            this.children.push(childNode);
        }

        this.removeChild = function(id){
            for(var i=0;i<self.children.length;i++){
                if(self.children[i].data.id == id){
                    self.children.splice(i,1);
                    return;
                }
            }
        }

        this.render = function(opts){
            var childLength = self.children.length,
                mainTable;

            mainTable = "<table cellpadding='0' cellspacing='0' border='0'>";
            var nodeColspan = childLength>0?2*childLength:2;
            mainTable += "<tr><td colspan='"+nodeColspan+"'>"+self.formatNode(opts)+"</td></tr>";

            if(childLength > 0){
                var downLineTable = "<table cellpadding='0' cellspacing='0' border='0'><tr class='lines x'><td class='line left half'></td><td class='line right half'></td></table>";
                mainTable += "<tr class='lines'><td colspan='"+childLength*2+"'>"+downLineTable+'</td></tr>';

                var linesCols = '';
                for(var i=0;i<childLength;i++){
                    if(childLength==1){
                        linesCols += "<td class='line left half'></td>";    // keep vertical lines aligned if there's only 1 child
                    }
                    else if(i==0){
                        linesCols += "<td class='line left'></td>";     // the first cell doesn't have a line in the top
                    }
                    else{
                        linesCols += "<td class='line left top'></td>";
                    }

                    if(childLength==1){
                        linesCols += "<td class='line right half'></td>";
                    }
                    else if(i==childLength-1){
                        linesCols += "<td class='line right'></td>";
                    }
                    else{
                        linesCols += "<td class='line right top'></td>";
                    }
                }
                mainTable += "<tr class='lines v'>"+linesCols+"</tr>";

                mainTable += "<tr>";
                for(var i in self.children){
                    mainTable += "<td colspan='2'>"+self.children[i].render(opts)+"</td>";
                }
                mainTable += "</tr>";
            }
            mainTable += '</table>';
            return mainTable;
        }

        this.formatNode = function(opts){
            var nameString = '',
                descString = '';
            if(typeof data.name !== 'undefined'){
             
                nameString = "<h2 style='background-color: "+color_array[self.data.module]+";color: black;'>"+self.data.name+"</h2>";
            }
            if(typeof data.description !== 'undefined'){
                descString = '<p>'+self.data.description+'</p>';
            }
            // if(opts.showControls){
            //     var buttonsHtml = "<div class='org-add-button'>"+opts.newNodeText+"</div><div class='org-del-button'></div>";
            // }
            // else{
                var buttonsHtml = '';
            // }
            return "<div class='node' node-id='"+this.data.id+"'>"+nameString+descString+buttonsHtml+"</div>";
        }
    }

})(jQuery);
