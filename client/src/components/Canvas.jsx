import React, {useState, useEffect, useRef} from 'react';
import '../styles/canvas.scss';
import {observer} from "mobx-react-lite";
import canvasState from "../store/canvasState";
import toolState from "../store/toolState";
import Brush from "../tools/Brush";
import Modal from "./Modal";
import {useParams} from "react-router-dom";
import Rect from "../tools/Rect";
import Circle from "../tools/Circle";
import axios from "axios";


const Canvas = observer(() => {
    const usernameRef = useRef()
    const canvasRef = useRef()
    const [isModal, setModal] = useState(true)
    const params = useParams()


    useEffect(() => {
        canvasState.setCanvas(canvasRef.current)
        axios.get(`http://localhost:5000/image?id=${params.id}`)
            .then(response => {
                const img = new Image()
                img.src = response.data
                img.onload = () => {
                    const ctx = canvasRef.current.getContext('2d')
                    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
                    ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height)
                }
            })
    }, [])


    useEffect(() => {
        if (canvasState.username) {
            const socket = new WebSocket('ws://localhost:5000/')
            canvasState.setSocket(socket)
            canvasState.setSessionId(params.id)
            toolState.setTool(new Brush(canvasRef.current, socket, params.id))

            socket.onopen = () => {
                console.log('eeee')
                socket.send(JSON.stringify({
                    id: params.id,
                    username: canvasState.username,
                    method: "connection"
                }))
            }
            socket.onmessage = (event) => {
                let msg = JSON.parse(event.data)
                switch (msg.method) {
                    case "connection":
                        console.log("ooooo")
                        break
                    case "draw":
                        drawHandler(msg)
                        break
                    default:
                        console.log("hyi")
                }
            }
        }
    }, [canvasState.username])


    const drawHandler = (msg) => {
        const figure = msg.figure
        const ctx = canvasRef.current.getContext('2d')
        switch (figure.type) {
            case 'brush':
                Brush.draw(ctx, figure.x, figure.y)
                break
            case 'rect':
                Rect.staticDraw(ctx, figure.x, figure.y, figure.width, figure.height, figure.color)
                break
            case 'circle':
                Circle.staticDraw(ctx, figure.x, figure.y,figure.radius, figure.color)
                break
            case 'finish':
                ctx.beginPath()
                break
        }
    }

    const onClose = () => setModal(false)

    const mouseDownHandler = () => {
        canvasState.pushToUndo(canvasRef.current.toDataURL())
        axios.post(`http://localhost:5000/image?id=${params.id}`, {img:canvasRef.current.toDataURL()})
            .then(response => console.log(response.data))
    }


    const handleSubmit = (username) => {
        canvasState.setUserName(username)
        setModal(false)
    };

    return (
        <div className="canvas">
            <button onClick={() => setModal(true)}>Клик-клик-клик</button>
            <Modal
                visible={isModal}
                title='Введите ваше имя'
                name={usernameRef}
                footer="Войти"
                onClose={onClose}
                onSubmit={handleSubmit}
            />
            <canvas ref={canvasRef} onMouseDown={() => mouseDownHandler()} width={600} height={400}></canvas>
        </div>
    );
});

export default Canvas;