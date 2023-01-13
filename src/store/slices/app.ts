import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const between = (min:number, max:number)=>{
    return Math.floor(min + Math.random() * (max + 1 - min));
}

export interface IApp{
    user: null;
    procent: number;
}

const initialState: IApp = {
    user: null,
    procent: 1
};

const sliceApp = createSlice({
    name: 'app',
    initialState,
    reducers:{
        setProcent(state, action: PayloadAction<number>){
            console.log('setProcent = ', action.payload);
            state.procent = action.payload;
        }
    },
    extraReducers:(builder)=>{

    }
});

export const { setProcent } = sliceApp.actions;

export default sliceApp;