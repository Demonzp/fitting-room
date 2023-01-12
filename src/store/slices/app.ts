import { createSlice } from '@reduxjs/toolkit';

const between = (min:number, max:number)=>{
    return Math.floor(min + Math.random() * (max + 1 - min));
}

export interface IApp{
    user: null;
}

const initialState: IApp = {
    user: null
};

const sliceApp = createSlice({
    name: 'app',
    initialState,
    reducers:{

    },
    extraReducers:(builder)=>{

    }
});

export default sliceApp;