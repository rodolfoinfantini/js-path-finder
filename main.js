const table = document.querySelector('table')
let cells = document.querySelectorAll('td')
const button = document.querySelector('button.start')
const clear = document.querySelector('button.clear')
const inputDelay = document.querySelector(`input[name="delay"]`)

const grid = {width: 45, height: 40}

const nodes = []

let delay = 10

inputDelay.value = delay

inputDelay.oninput = () => {
    if(!isNaN(parseInt(inputDelay.value))){
        delay = parseInt(inputDelay.value)
    }
}

clear.onclick = () => {
    obstaculos = []
    localStorage.setItem('obstaculos',null)
    updateColors()
}

const start = {x: 1, y: grid.height - 2, g: 0, h: undefined, f: undefined}
const end = {x: grid.width - 3, y: 1, g: undefined, h: 0, f: undefined}
let obstaculos = JSON.parse(localStorage.getItem('obstaculos')) || []
const path = []

let closestPath = []



let open = []
let closed = []

function getDistance(node1, node2){
    const distance = {x: Math.abs(node1.x - node2.x), y: Math.abs(node1.y - node2.y)}
    return Math.floor(Math.sqrt(Math.pow(distance.x,2) + Math.pow(distance.y,2)) * 10)
}

start.h = getDistance(start,end)
start.f = start.g + start.h

end.g = getDistance(end,start)
end.f = end.g + end.h

open.push(start)

for(let i = 0; i < grid.height; i++) {
    for(let j = 0; j < grid.width; j++) {
        nodes.push({x: j, y: i, g: undefined, h: undefined, f: undefined})
    }
}

function generateGrid() {
    let newHtml = ''
    for(let i = 0; i < grid.height; i++) {
        newHtml += '<tr>'
        for(let j = 0; j < grid.width; j++) {
            newHtml += `<td class="x${j} y${i}"></td>`
        }
        newHtml += '</tr>'
    }
    table.innerHTML = newHtml
    cells = document.querySelectorAll('td')
    document.querySelector(`.x${start.x}.y${start.y}`).classList.add('blue')
    document.querySelector(`.x${end.x}.y${end.y}`).classList.add('blue')
    cells.forEach(e => {
        e.onclick = () => {
            
            const cellClass = e.classList
            if(!contains(obstaculos,{x: cellClass[0].replace('x',''), y: cellClass[1].replace('y','')})){
                obstaculos.push({x: cellClass[0].replace('x',''), y: cellClass[1].replace('y','')})
            }
            else{
                obstaculos.splice(findByXY(obstaculos,{x: cellClass[0].replace('x',''), y: cellClass[1].replace('y','')}),1)
            }
            updateColorsObstaculos(obstaculos[obstaculos.length - 1])
            localStorage.setItem('obstaculos',JSON.stringify(obstaculos))
        }
    })
}

generateGrid()

let current = start

function startLoop(){
    open = []
    closed = []
    closestPath = []
    open.push(start)
    updateColors()
    cells.forEach(e => {
        e.classList.remove('path')
    })
    let loop = true
    if(delay == 0){
        while(loop){
            current = getLowestF(open)
            open.splice(open.indexOf(current), 1)
            closed.push(current)
            // updateColorsClosed(current)
            if(current.x == end.x && current.y == end.y){
                // clearInterval(timer)
                for(let i = closed.length - 1; i >= 0; i--){
                    if(closed[i].x == start.x && closed[i].y == start.y) break
                    closestPath.push(closed[i].parent)
                    i = findIndexByParent(closed,closed[i].parent) + 1
                }
                updateColors()
                cells.forEach(e => {
                    e.classList.remove('green')
                    e.classList.remove('red')
                })
                loop = false
                return
            }
            getNeighbours(current).forEach(e => {
                if(!(contains(obstaculos,e) || contains(closed,e)) && (!contains(open,e) || path[path.length - 1].g < e.g)){
                    e.g = getDistance(e,start)
                    e.h = getDistance(e,end)
                    e.f = e.g + e.h
                    e.parent = current
                    if(!contains(open,e)) open.push(e)
                    path.push(e)
                    // updateColorsOpen(e)
                }
            })
        }
    }else{
        let timer = setInterval(function(){
            current = getLowestF(open)
            open.splice(open.indexOf(current), 1)
            closed.push(current)
            updateColorsClosed(current)
            if(current.x == end.x && current.y == end.y){
                clearInterval(timer)
                for(let i = closed.length - 1; i >= 0; i--){
                    if(closed[i].x == start.x && closed[i].y == start.y) break
                    closestPath.push(closed[i].parent)
                    i = findIndexByParent(closed,closed[i].parent) + 1
                }
                updateColors()
                cells.forEach(e => {
                    e.classList.remove('green')
                    e.classList.remove('red')
                })
                return
            }
            getNeighbours(current).forEach(e => {
                if(!(contains(obstaculos,e) || contains(closed,e)) && (!contains(open,e) || path[path.length - 1].g < e.g)){
                    e.g = getDistance(e,start)
                    e.h = getDistance(e,end)
                    e.f = e.g + e.h
                    e.parent = current
                    if(!contains(open,e)) open.push(e)
                    path.push(e)
                    updateColorsOpen(e)
                }
            })
        },delay)
    }
}

function findIndexByParent(arr,value){
    for(let i = 0; i < arr.length; i++){
        if(arr[i].x == value.x && arr[i].y == value.y) return i
    }
}

function updateColorsOpen(el){
    document.querySelector(`.x${el.x}.y${el.y}`).classList.add('green')
}
function updateColorsClosed(el){
    document.querySelector(`.x${el.x}.y${el.y}`).classList.add('red')
}

function updateColorsObstaculos(el){
    document.querySelector(`.x${el.x}.y${el.y}`).classList.add('black')
}

function updateColors(){
    const green = document.querySelectorAll('.green'), red = document.querySelectorAll('.red'), black = document.querySelectorAll('.black')
    for(let i = 0; i < green.length; i++) green[i].classList.remove('green')
    for(let i = 0; i < red.length; i++) red[i].classList.remove('red')
    for(let i = 0; i < black.length; i++) black[i].classList.remove('black')
    for(let i = 0; i < open.length; i++) document.querySelector(`.x${open[i].x}.y${open[i].y}`).classList.add('green')
    for(let i = 0; i < closed.length; i++) document.querySelector(`.x${closed[i].x}.y${closed[i].y}`).classList.add('red')
    for(let i = 0; i < obstaculos.length; i++) document.querySelector(`.x${obstaculos[i].x}.y${obstaculos[i].y}`).classList.add('black')
    for(let i = 0; i < closestPath.length; i++) document.querySelector(`.x${closestPath[i].x}.y${closestPath[i].y}`).classList.add('path')
}

updateColors()

function contains(arr,obj){
    if(arr.length <= 0) return false
    let contain = false
    arr.forEach(e => {
        if(e.x == obj.x && e.y == obj.y){
            contain = true
            return contain
        }
    })
    return contain
}
function findByXY(arr,obj){
    if(arr.length <= 0) return -1
    let index = 0
    arr.forEach((e,i) => {
        if(e.x == obj.x && e.y == obj.y){
            index = i
            return index
        }
    })
    return index
}

function getLowestF(arr){
    if(arr.length < 1) return undefined
    let low = arr[0].f
    let lowFIndex = 0
    for(let i = 0; i < arr.length; i++){
        if(arr[i].f < low){
            low = arr[i].f
            lowFIndex = i
        }
    }
    let equalIndex = []
    for(let i = 0; i < arr.length; i++){
        if(arr[i].f == low) equalIndex.push(i)
    }
    let lowH = arr[0].h
    let lowHIndex = 0
    if(equalIndex.length > 1){
        for(let i = 0; i < arr.length; i++){
            if(arr[i].h < lowH){
                lowH = arr[i].h
                lowHIndex = i
            }
        }
        return arr[lowHIndex]
    }
    return arr[lowFIndex]
}

function getLowestH(arr){

}

function getNeighbours(arr){
    const neighbor = []
    if(arr.x + 1 < grid.width){
        neighbor.push({x: arr.x + 1, y: arr.y, g: undefined, h: undefined, f: undefined})
        if(arr.y + 1 < grid.height){
            neighbor.push({x: arr.x + 1, y: arr.y + 1, g: undefined, h: undefined, f: undefined})
        }
        if(arr.y - 1 >= 0){
            neighbor.push({x: arr.x + 1, y: arr.y - 1, g: undefined, h: undefined, f: undefined})
        }
    }
    if(arr.x - 1 >= 0){
        neighbor.push({x: arr.x - 1, y: arr.y, g: undefined, h: undefined, f: undefined})
        if(arr.y + 1 < grid.height){
            neighbor.push({x: arr.x - 1, y: arr.y + 1, g: undefined, h: undefined, f: undefined})
        }
        if(arr.y - 1 >= 0){
            neighbor.push({x: arr.x - 1, y: arr.y - 1, g: undefined, h: undefined, f: undefined})
        }
    }
    if(arr.y + 1 < grid.height){
        neighbor.push({x: arr.x, y: arr.y + 1, g: undefined, h: undefined, f: undefined})
    }
    if(arr.y - 1 >= 0){
        neighbor.push({x: arr.x, y: arr.y - 1, g: undefined, h: undefined, f: undefined})
    }
    return neighbor
}


button.onclick = startLoop