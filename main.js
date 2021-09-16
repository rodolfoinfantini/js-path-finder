const table = document.querySelector('table')
let cells = document.querySelectorAll('td')
const button = document.querySelector('button.start')
const clear = document.querySelector('button.clear')
const inputDelay = document.querySelector(`input[name="delay"]`)

const grid = {width: 45, height: 40}

const nodes = []

let delay = 100

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
            updateColors()
            localStorage.setItem('obstaculos',JSON.stringify(obstaculos))
        }
    })
}

generateGrid()

let current = start

function startLoop(){
    updateColors()
    cells.forEach(e => {
        e.classList.remove('path')
    })
    let timer = setInterval(function(){
        if(open.length <= 0){
            return
        }
        current = getLowestF(open)
        open.splice(open.indexOf(current), 1)
        closed.push(current)
        if(current.x == end.x && current.y == end.y){
            console.log('path found')
            cells.forEach(e => {
                e.classList.remove('path')
            })
            clearInterval(timer)
            for(let i = closed.length - 1; i >= 0; i--){
                if(closed[i].x == start.x && closed[i].y == start.y) break
                closestPath.push(closed[i].parent)
                i = findIndexByParent(closed,closed[i].parent) + 1
            }
            updateColors()
            cells = document.querySelectorAll('td')
            cells.forEach(e => {
                e.classList.remove('green')
                e.classList.remove('red')
            })
            open = []
            closed = []
            closestPath = []
            open.push(start)
            return
        }
        getNeighbours(current).forEach(e => {
            if(contains(obstaculos,e) || contains(closed,e)){
                return
            }
            if(path.length <= 0){
                path.push(e)
            }
            if(!contains(open,e) || path[path.length - 1].g < e.g){
                e.g = getDistance(e,start)
                e.h = getDistance(e,end)
                e.f = e.g + e.h
                e.parent = current
                if(!contains(open,e)) open.push(e)
                path.push(e)
                updateColors()
            }
        })
    },delay)
}

function findIndexByParent(arr,value){
    for(let i = 0; i < arr.length; i++){
        if(arr[i].x == value.x && arr[i].y == value.y) return i
    }
}


function updateColors(){
    if(document.querySelectorAll('.green').length > 0) document.querySelectorAll('.green').forEach(e => {e.classList.remove('green')})
    if(document.querySelectorAll('.red').length > 0) document.querySelectorAll('.red').forEach(e => {e.classList.remove('red')})
    if(document.querySelectorAll('.path').length > 0) document.querySelectorAll('.path').forEach(e => {e.classList.remove('path')})
    if(document.querySelectorAll('.black').length > 0) document.querySelectorAll('.black').forEach(e => {e.classList.remove('black')})
    
    if(open.length > 0){
        open.forEach(e => {
            document.querySelector(`.x${e.x}.y${e.y}`).classList.add('green')
            // document.querySelector(`.x${e.x}.y${e.y}`).innerText = `g:${e.g} h:${e.h} f: ${e.f}`
        })
    }
    
    if(closed.length > 0){
        closed.forEach(e => {
            document.querySelector(`.x${e.x}.y${e.y}`).classList.add('red')
            // document.querySelector(`.x${e.x}.y${e.y}`).innerText = `g:${e.g} h:${e.h} f: ${e.f}`
        })
    }

    if(obstaculos.length > 0){
        obstaculos.forEach(e => {
            document.querySelector(`.x${e.x}.y${e.y}`).classList.add('black')
        })
    }

    if(path.length > 0){
        path.forEach(e => {
            // document.querySelector(`.x${e.x}.y${e.y}`).classList.add('path')
        })
    }

    if(closestPath.length > 0){
        closestPath.forEach(e => {
            document.querySelector(`.x${e.x}.y${e.y}`).classList.add('path')
        })
    }
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