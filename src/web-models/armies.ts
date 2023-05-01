export interface IStackModel {
    unit: string
    qty: number
}

export interface IArmiesModel {
    player: IStackModel[]
    enemy: IStackModel[]
}