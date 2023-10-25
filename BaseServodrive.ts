import WsHandler from '@models/WsHandler'
import { IServoCommand } from '../../models/AppModel'
import { WsModel } from '../../models/WsModel'
import { IComponent } from '../IComponent'
import backgroundConfig from './background'
import './circularSliderBar.less'
import { ServoWsHandler } from './ServoWsHandler'

export class BaseServodrive implements IComponent {
    private isDragging: boolean = false
    protected order: number
    private classNamePrefix: string
    protected root: HTMLElement
    protected handler: WsHandler
    protected wsmodel: WsModel
    private radius : number = 140
    protected initialAngle:number

    constructor(classNamePrefix: string, root: HTMLElement, order: number, initialAngle:number) {
        console.log("123")
        this.classNamePrefix = classNamePrefix
        this.root = root
        this.order = order
        this.handler = new ServoWsHandler()
        this.wsmodel = new WsModel()
        this.initialAngle= initialAngle
        
        
    }

    public render(): void {
        const html = `
        <div class="circular-slider-bar">
        <h2 class="subtitle">Сервопривод ${this.order + 1}</h2>
        <svg class="${this.classNamePrefix}-circular-slider-bar" height="274" width="274">
                <linearGradient id="Gradient1" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stop-color="#0E2F4E" />
                    <stop offset="90%" stop-color="#000000" />
                </linearGradient>
                <g>
                ${backgroundConfig()} 
                    <g id="rim" transform="translate(137,137)">
                        <defs>
                            <clipPath id="cut-off-top">
                                <rect x="-114" y="0" width="228" height="112" />
                            </clipPath>
                        </defs>
                        <circle r="112" stroke="#B6C2CD" stroke-width="2" fill="url(#Gradient1)" class="ring"></circle>
                        <circle r="112" stroke="red" stroke-width="2" fill="red" class="ring" clip-path="url(#cut-off-top)"></circle>
                    </g>
                    <g mask="url(#mask0_1415_1227)" transform="translate(0, 0)">
                        <circle cx="138" cy="138" r="112" fill="#CAD9E7" fill-opacity="0.5"/>
                    </g>
                    <g id="rim1" transform="translate(137,137)">
                        <circle id="${
                            this.classNamePrefix
                        }-click-circle" stroke="transparent" r="5" stroke-width="224" fill="none" class="ring"></circle>
                    </g>
                    <line x1="0" y1="137" x2="274" y2="137" stroke="#FFFFFF" stroke-width="2" />
                    <line x1="137" y1="0" x2="137" y2="274" stroke="#FFFFFF" stroke-width="2" />
                    <line class="${
                        this.classNamePrefix
                    }-arrow" x1="137" y1="137" x2="20" y2="137" stroke="#D6E1EB" stroke-width="4" />
                    <circle r="3" class="circle-box-shadow" transform="translate(137,137)" fill="#DAE4EE" stroke="#ACBBCA" stroke-width="1"></circle>
                    <g id="handles" transform="translate(137,137)">
                        <circle class="${
                            this.classNamePrefix
                        }-draggable draggable" circle-box-shadow" r="9" fill="#DAE4EE" stroke="#ACBBCA" stroke-width="1" transform="rotate(${this.initialAngle}),translate(-115,0)"></circle>
                        <circle class="${
                            this.classNamePrefix
                        }-draggable draggable" r="5" fill="#9B0F0D" transform="rotate(${this.initialAngle}),translate(-115,0)"></circle>
                    </g>
                </g>
            </svg>
        </div>
        `

        const el = document.createElement('div')
        el.innerHTML = html

        this.root.appendChild(el)
    }

    public init(): void {
        this.initDraggable()

        const e = document.querySelector(`.${this.classNamePrefix}-circular-slider-bar`) as HTMLElement
        if (e) {
            const dragableElement = document.querySelectorAll(`.${this.classNamePrefix}-draggable`)
            if (dragableElement.length > 0) {
                const arrow = document.querySelector(`.${this.classNamePrefix}-arrow`)
                if (dragableElement[0].parentElement) {
                    if (arrow) {
                        let x,y
                        x = dragableElement[0].parentElement.getClientRects()[0].x
                        y = dragableElement[0].parentElement.getClientRects()[0].y
                        console.log(dragableElement[0].parentElement)
                        arrow.setAttribute('y2', String(y - e.getClientRects()[0].y + 10))
                        arrow.setAttribute('x2', String(x - e.getClientRects()[0].x + 10))
                    }
                }
            }
        }
        

        const el = document.querySelector(`.${this.classNamePrefix}-draggable`)
        if (el) {
            let observer = new MutationObserver((records) => {
                let angle: number
                let transform = el.getAttribute('transform')
                if (transform) {
                    transform = transform.replace('rotate(', '')
                    transform = transform.split('),translate')[0]
                    angle = Math.trunc(Number(transform))
                    if (angle > 360 || angle < 181) return
                    if (angle > 0 && angle < 180) {
                        angle = angle + 180
                    }
                    if (angle > 180 && angle < 360) {
                        angle = angle - 180
                    }

                    // this.sendCommand({ angle })
                }
            })
            observer.observe(el, {
                attributeFilter: ['transform'],
            })
        }
    }

    private initDraggable(): void {
        const el = document.querySelector(`.${this.classNamePrefix}-circular-slider-bar`) as HTMLElement

        const circleClick = document.getElementById(`${this.classNamePrefix}-click-circle`)

        if (circleClick) {
            circleClick.addEventListener('click', (e) => {
                const arrow = document.querySelector(`.${this.classNamePrefix}-arrow`)
                const dragableElement = document.querySelectorAll(`.${this.classNamePrefix}-draggable`)
                console.log(dragableElement)
                var x1 = e.offsetX - this.radius
                var y1 = e.offsetY - this.radius
                var newAngle = Math.atan2(y1, x1) * (180 / Math.PI)
                if (newAngle < 0) {
                    newAngle = 360 + newAngle
                }

                if (newAngle > 360 || newAngle < 181) return

                this.getCoordinatesByElement(dragableElement,arrow,newAngle,el)
            })
        }

        if (el) {
            el.style.touchAction = 'none'
            el.addEventListener('pointerdown', (e) => {
                e.preventDefault()
                console.log(e)
                const targetElement = e.target as HTMLElement
                let clName: string = ''
                const foo = function bar(e: Event) {
                    let event = e as MouseEvent
                    const dragableElement = document.querySelectorAll(`.${clName}-draggable`)
                    const arr = Array.from(dragableElement)
                    const arrow = document.querySelector(`.${clName}-arrow`)
                    var x1 = event.clientX - 140 - el.getClientRects()[0].x
                    var y1 = event.clientY - 140 - el.getClientRects()[0].y
                    var newAngle = Math.atan2(y1, x1) * (180 / Math.PI)
                    if (newAngle < 0) {
                        newAngle = 360 + newAngle
                    }

                    if (newAngle > 360 || newAngle < 181) return

                    dragableElement.forEach((element) => {
                        element.setAttributeNS(null, 'transform', 'rotate(' + newAngle + '),translate(112,0)')
                    })
                    if (arrow) {
                        let x, y
                        if (dragableElement[0].parentElement) {
                            x = dragableElement[0].parentElement.getClientRects()[0].x
                            y = dragableElement[0].parentElement.getClientRects()[0].y
                            arrow.setAttribute('y2', String(y - el.getClientRects()[0].y + 10))
                            arrow.setAttribute('x2', String(x - el.getClientRects()[0].x + 10))
                        }
                    }
                }

                if (targetElement.classList.contains(`draggable`)) {
                    clName = targetElement.classList.value.split('-draggable')[0]
                    document.addEventListener('pointermove', foo)
                    document.addEventListener('pointerup', () => document.removeEventListener('pointermove', foo))
                }
            })
        }
    }

    // private sendCommand(command: IServoCommand): void {
    //     this.handler.send(command)
    // }

    // private openConnection(): void {
    //     if (this.handler) {
    //         this.wsmodel.open(`ws://${document.location.host}/servo${this.order}`, this.handler)
    //     }
    // }
    private getCoordinatesByElement(dragableElement: NodeListOf<Element>, 
        arrow: Element | null, newAngle:number, el: HTMLElement): any{
            let x:number|undefined
            let y:number|undefined
            let coordinates={x,y}
                if (arrow) {
                    
                    if (dragableElement[0].parentElement) {
                        x = dragableElement[0].parentElement.getClientRects()[0].x
                        y = dragableElement[0].parentElement.getClientRects()[0].y
                        console.log(dragableElement[0].parentElement)
                        arrow.setAttribute('y2', String(y - el.getClientRects()[0].y + 10))
                        arrow.setAttribute('x2', String(x - el.getClientRects()[0].x + 10))
                        console.log(x,y)
                        // return {x,y}
                    }
                }
                return coordinates
    }

}
