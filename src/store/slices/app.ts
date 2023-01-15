import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Keypoint } from '@tensorflow-models/pose-detection';

const between = (min:number, max:number)=>{
    return Math.floor(min + Math.random() * (max + 1 - min));
}

export interface IApp{
    user: null;
    procent: number;
    poses: Keypoint [];
}

const initialState: IApp = {
    user: null,
    procent: 1,
    poses: [],
};

const sliceApp = createSlice({
    name: 'app',
    initialState,
    reducers:{
        setProcent(state, action: PayloadAction<number>){
            console.log('setProcent = ', action.payload);
            state.procent = action.payload;
        },

        setPoses(state, action: PayloadAction<Keypoint []>){
            state.poses = action.payload;
        },
    },
    extraReducers:(builder)=>{

    }
});

export const { setProcent, setPoses } = sliceApp.actions;

export default sliceApp;