import { BaseServodrive } from '../CircularSliderBar/BaseServodrive'
import { IComponent } from '../IComponent'
import './servodrivePanel.less'
import { IServoCommand } from '../../models/AppModel'
import WsHandler from '@models/WsHandler'
import { WsModel } from '@models/WsModel'

export class RServodrive extends BaseServodrive {
    wsmodel:WsModel
    handler:WsHandler
    initialAngle:number
    
    // constructor(classNamePrefix: string, root: HTMLElement, order: number, initialAngle:number) {   
    //     // super(openConnection())
    //   }
      
    public rotateHandle():void{
        this.openConnection()
        if (this.initialAngle > 360 || this.initialAngle < 181) return
        if (this.initialAngle > 0 && this.initialAngle < 180) {
            this.initialAngle = this.initialAngle + 180
        }
        if (this.initialAngle > 180 && this.initialAngle < 360) {
            this.initialAngle = this.initialAngle - 180
        }
        let angle=this.initialAngle
        this.buildCommand({angle})
    }

    private buildCommand(command: IServoCommand): void {
            this.handler.send(command)
        }
    
    // private sendCommand(command: IServoCommand): void {
    //     this.handler.send(command)
    // }

    private openConnection(): void {
        if (this.handler) {
            this.wsmodel.open(`ws://${document.location.host}/servo-1${this.order}`, this.handler)
        }
    }
    // private openConnection(): void {
    //     if (this.handler) {
    //     this.wsmodel.open(`ws://${document.location.host}/servo${this.order}`, this.handler)
    //     }
    // }
}