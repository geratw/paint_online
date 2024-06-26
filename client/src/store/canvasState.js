import {makeAutoObservable} from "mobx";

class CanvasState {
    canvas = null
    socket = null
    sessionID = null
    undoList = []
    redoList = []
    username = ""

    constructor() {
        makeAutoObservable(this)
    }

    setUserName(name) {
        this.username = name
    }

    setSessionId(id) {
        this.sessionID = id
    }

    setSocket(socket) {
        this.socket = socket
    }

    pushToRedo(data) {
        this.redoList.push(data)
    }

    pushToUndo(data) {
        this.undoList.push(data)
    }

    undo() {
        let ctx = this.canvas.getContext('2d')
        if (this.undoList.length > 0) {
            let dataUrl = this.undoList.pop()
            this.redoList.push(this.canvas.toDataURL())
            let img = new Image()
            img.src = dataUrl
            img.onload = () => {
                ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
                ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height)
            }
        } else {
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        }
    }

    redo() {
        let ctx = this.canvas.getContext('2d')
        if (this.redoList.length > 0) {
            let dataUrl = this.redoList.pop()
            this.undoList.push(this.canvas.toDataURL())
            let img = new Image()
            img.src = dataUrl
            img.onload = () => {
                ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
                ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height)
            }
        }
    }

    setCanvas(canvas) {
        this.canvas = canvas
    }


}

export default new CanvasState()