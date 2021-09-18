const table = document.querySelector('table')
let cells = document.querySelectorAll('td')
const button = document.querySelector('button.start')
const clear = document.querySelector('button.clear')
const inputDelay = document.querySelector(`input[name="delay"]`)

const loadBtn = document.querySelector('button.load.obs')
const loadInput = document.querySelector(`input[name="loadobs"]`)

const loadGridBtn = document.querySelector('button.load.grid')
const loadGridInput = document.querySelector(`input[name="loadgrid"]`)

const loadStartBtn = document.querySelector('button.load.start')
const loadStartInput = document.querySelector(`input[name="loadstart"]`)

const exportBtn = document.querySelector('button.export.obs')
const exportInput = document.querySelector(`textarea[name="exportobs"]`)
const copyBtn = document.querySelector('button.copy.obs')

const exportGridBtn = document.querySelector('button.export.grid')
const exportGridInput = document.querySelector(`textarea[name="exportgrid"]`)
const copyGridBtn = document.querySelector('button.copy.grid')

const exportStartBtn = document.querySelector('button.export.start')
const exportStartInput = document.querySelector(`textarea[name="exportstart"]`)
const copyStartBtn = document.querySelector('button.copy.start')

const widthInput = document.querySelector('input[name="width"]')
const widthLabel = document.querySelector('label[for="width"].value')
const heightInput = document.querySelector('input[name="height"]')
const heightLabel = document.querySelector('label[for="height"].value')
const setupInput = document.querySelectorAll('input[name="setup"]')


const grid = JSON.parse(localStorage.getItem('grid')) || {width: 30, height: 20}

const nodes = []

let delay = 10

inputDelay.value = delay

let setup = 'start'

setupInput.forEach(e => {
    e.onchange = () => {
        if(e.checked) {
            setup = e.className
        }
    }
})


function updateWidthHeight(value) {
    grid.width = value.width
    grid.height = value.height
    if(start.x >= grid.width){
        updateStart({x: grid.width - 1, y: start.y})
    }
    if(start.y >= grid.height){
        updateStart({x: start.x, y: grid.height - 1})
    }
    if(end.y >= grid.height){
        updateEnd({x: end.x, y: grid.height - 1})
    }
    if(end.x >= grid.width){
        updateEnd({x: grid.width - 1, y: end.y})
    }
    generateGrid()
    updateColorsObstaculosAll()
    widthInput.value = grid.width
    heightInput.value = grid.height
    widthLabel.innerText = grid.width
    heightLabel.innerText = grid.height
}

function updateStart(pos){
    start.x = pos.x
    start.y = pos.y
    start.h = getDistance(start,end)
    start.f = start.g + start.h
    end.g = getDistance(end,start)
    end.f = end.g + end.h
    open = []
    open.push(start)
    generateGrid()
    updateColorsObstaculosAll()
    localStorage.setItem('start',JSON.stringify(start))
}

function updateEnd(pos){
    end.x = pos.x
    end.y = pos.y
    start.h = getDistance(start,end)
    start.f = start.g + start.h
    end.g = getDistance(end,start)
    end.f = end.g + end.h
    open = []
    open.push(start)
    generateGrid()
    updateColorsObstaculosAll()
    localStorage.setItem('end',JSON.stringify(end))
}




widthInput.oninput = () => {
    updateWidthHeight({width: widthInput.value, height: heightInput.value})
    localStorage.setItem('grid',JSON.stringify(grid))
}
heightInput.oninput = () => {
    updateWidthHeight({width: widthInput.value, height: heightInput.value})
    localStorage.setItem('grid',JSON.stringify(grid))
}

inputDelay.oninput = () => {
    if(!isNaN(parseInt(inputDelay.value))){
        delay = parseInt(inputDelay.value)
    }
}

clear.onclick = () => {
    obstaculos = []
    localStorage.setItem('obstaculos',null)
    updateColorsObstaculosAll()
}

const start = JSON.parse(localStorage.getItem('start')) || {x: 1, y: grid.height - 2, g: 0, h: undefined, f: undefined}
const end = JSON.parse(localStorage.getItem('end')) || {x: grid.width - 2, y: 1, g: undefined, h: 0, f: undefined}
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

let isCliking = false

table.addEventListener('mousedown', () => {
    isCliking = true
})
table.addEventListener('mouseup', () => {
    isCliking = false
})
table.addEventListener('mouseleave', () => {
    isCliking = false
})

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
    try{
        document.querySelector(`.x${start.x}.y${start.y}`).classList.add('cyan')
        document.querySelector(`.x${end.x}.y${end.y}`).classList.add('blue')
    }catch(e){

    }
    
    cells.forEach(e => {
        e.addEventListener('mousedown',() => {
            const cellClass = e.classList
            if(setup == 'obs'){
                if(!contains(obstaculos,{x: cellClass[0].replace('x',''), y: cellClass[1].replace('y','')})){
                    obstaculos.push({x: cellClass[0].replace('x',''), y: cellClass[1].replace('y','')})
                }
                else{
                    obstaculos.splice(findByXY(obstaculos,{x: cellClass[0].replace('x',''), y: cellClass[1].replace('y','')}),1)
                }
                updateColorsObstaculosAll()
                localStorage.setItem('obstaculos',JSON.stringify(obstaculos))
            }
            else if(setup == 'start'){
                updateStart({x: parseInt(cellClass[0].replace('x','')), y: parseInt(cellClass[1].replace('y',''))})
            }else if(setup == 'end'){
                updateEnd({x: parseInt(cellClass[0].replace('x','')), y: parseInt(cellClass[1].replace('y',''))})
            }
        }) 
        e.addEventListener('mouseover', () => {
            if(setup != 'obs') return
            if(!isCliking) return
            const cellClass = e.classList
            if(!contains(obstaculos,{x: cellClass[0].replace('x',''), y: cellClass[1].replace('y','')})){
                obstaculos.push({x: cellClass[0].replace('x',''), y: cellClass[1].replace('y','')})
            }
            else{
                obstaculos.splice(findByXY(obstaculos,{x: cellClass[0].replace('x',''), y: cellClass[1].replace('y','')}),1)
            }
            updateColorsObstaculosAll()
            localStorage.setItem('obstaculos',JSON.stringify(obstaculos))
        })
    })
}



updateWidthHeight(grid)




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
    try {
        document.querySelector(`.x${el.x}.y${el.y}`).classList.add('green')
    } catch (error) {
        
    }
}
function updateColorsClosed(el){
    try {
        document.querySelector(`.x${el.x}.y${el.y}`).classList.add('red')
    } catch (error) {
        
    }
}

function updateColorsObstaculos(el){
    try{
        document.querySelector(`.x${el.x}.y${el.y}`).classList.add('black')
    }catch (error) {

    }
}
function updateColorsObstaculosAll(){
    const black = document.querySelectorAll('.black')
    for(let i = 0; i < black.length; i++) {
        try{
            black[i].classList.remove('black')
        }catch(e){

        }
    }
    for(let i = 0; i < obstaculos.length; i++) {
        try {
            document.querySelector(`.x${obstaculos[i].x}.y${obstaculos[i].y}`).classList.add('black')
        } catch (error) {
            
        }
    } 
}

function updateColors(){
    const green = document.querySelectorAll('.green'), red = document.querySelectorAll('.red'), black = document.querySelectorAll('.black')
    for(let i = 0; i < green.length; i++) {
        try {
            green[i].classList.remove('green')
        } catch (error) {
            
        }
    }
    for(let i = 0; i < red.length; i++) {
        try {
            red[i].classList.remove('red')
        } catch (error) {
            
        }
    }
    for(let i = 0; i < black.length; i++) {
        try {
            black[i].classList.remove('black')
        } catch (e) {
            
        }
    }
    for(let i = 0; i < open.length; i++) {
        try{
            document.querySelector(`.x${open[i].x}.y${open[i].y}`).classList.add('green')
        }catch(e){

        }
    } 
    for(let i = 0; i < closed.length; i++) {
        try {
            document.querySelector(`.x${closed[i].x}.y${closed[i].y}`).classList.add('red')
        }catch(e){

        }
    }
    for(let i = 0; i < obstaculos.length; i++) {
        try{
            document.querySelector(`.x${obstaculos[i].x}.y${obstaculos[i].y}`).classList.add('black')
        }catch(e){

        }
    }
    for(let i = 0; i < closestPath.length; i++){
        try{
            document.querySelector(`.x${closestPath[i].x}.y${closestPath[i].y}`).classList.add('path')
        }catch(e){

        }
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
            if((!contains(obstaculos,{x: arr.x + 1, y: arr.y}) || !contains(obstaculos,{x: arr.x, y: arr.y + 1})) || arr.y + 1 >= grid.height || arr.x + 1 >= grid.width)
                neighbor.push({x: arr.x + 1, y: arr.y + 1, g: undefined, h: undefined, f: undefined})
        }
        if(arr.y - 1 >= 0){
            if((!contains(obstaculos,{x: arr.x + 1, y: arr.y}) || !contains(obstaculos,{x: arr.x, y: arr.y - 1})) || arr.y - 1 <= 0 || arr.x + 1 >= grid.width)
                neighbor.push({x: arr.x + 1, y: arr.y - 1, g: undefined, h: undefined, f: undefined})
        }
    }
    if(arr.x - 1 >= 0){
        neighbor.push({x: arr.x - 1, y: arr.y, g: undefined, h: undefined, f: undefined})
        if(arr.y + 1 < grid.height){
            if((!contains(obstaculos,{x: arr.x - 1, y: arr.y}) || !contains(obstaculos,{x: arr.x, y: arr.y + 1})) || arr.y + 1 >= grid.height || arr.x - 1 <= 0)
                neighbor.push({x: arr.x - 1, y: arr.y + 1, g: undefined, h: undefined, f: undefined})
        }
        if(arr.y - 1 >= 0){
            if((!contains(obstaculos,{x: arr.x - 1, y: arr.y}) || !contains(obstaculos,{x: arr.x, y: arr.y - 1})) || arr.y - 1 <= 0 || arr.x - 1 <= 0)
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

loadBtn.onclick = e => {
    e.preventDefault()
    try{
        try{
            let str = loadInput.value
            obstaculos = JSON.parse(str)
            updateColorsObstaculosAll()
            localStorage.setItem('obstaculos',JSON.stringify(obstaculos))
        }catch(e){
            let str = loadInput.value
            obstaculos = JSON.parse(JSON.parse(str))
            updateColorsObstaculosAll()
            localStorage.setItem('obstaculos',JSON.stringify(obstaculos))
        }
    }catch(e){
        alert('invalid input')
        loadInput.value = ''
    }
}
loadGridBtn.onclick = e => {
    e.preventDefault()
    try{
        try{
            let str = loadGridInput.value
            updateWidthHeight(JSON.parse(str))
            localStorage.setItem('grid',JSON.stringify(grid))
        }catch(e){
            let str = loadGridInput.value
            updateWidthHeight(JSON.parse(JSON.parse(str)))
            localStorage.setItem('grid',JSON.stringify(grid))
        }
    }catch(e){
        alert('invalid input')
        loadGridInput.value = ''
    }
}
loadStartBtn.onclick = e => {
    e.preventDefault()
    try{
        try{
            let str = loadStartInput.value
            const start = JSON.parse(str).start
            const end = JSON.parse(str).end
            updateStart(start)
            updateEnd(end)
            localStorage.setItem('start',JSON.stringify(start))
            localStorage.setItem('end',JSON.stringify(end))
        }catch(e){
            let str = loadStartInput.value
            const start = JSON.parse(JSON.parse(str)).start
            const end = JSON.parse(JSON.parse(str)).end
            updateStart(start)
            updateEnd(end)
            localStorage.setItem('start',JSON.stringify(start))
            localStorage.setItem('end',JSON.stringify(end))
        }
    }catch(e){
        alert('invalid input')
        loadStartInput.value = ''
    }
}

exportBtn.onclick = e => {
    e.preventDefault()
    try{
        exportInput.value = JSON.stringify(obstaculos)
    }
    catch(e){
        console.error(e)
    }
}
copyBtn.onclick = e => {
    e.preventDefault()
    navigator.clipboard.writeText(exportInput.value)
}

exportGridBtn.onclick = e => {
    e.preventDefault()
    try{
        exportGridInput.value = JSON.stringify(grid)
    }
    catch(e){
        console.error(e)
    }
}
copyGridBtn.onclick = e => {
    e.preventDefault()
    navigator.clipboard.writeText(exportGridInput.value)
}

exportStartBtn.onclick = e => {
    e.preventDefault()
    try{
        exportStartInput.value = JSON.stringify({start: start, end: end})
    }
    catch(e){
        console.error(e)
    }
}
copyStartBtn.onclick = e => {
    e.preventDefault()
    navigator.clipboard.writeText(exportStartInput.value)
}

button.onclick = startLoop