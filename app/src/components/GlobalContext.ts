import {useState} from 'react';

export const GlobalContext = () => {
    let [imgArr, setImgArr] = useState("");
    function getImgArr() {
        return imgArr;
    }

    function updateImgArr(imgInput: string) {
        setImgArr(imgInput);
    }

    return {
        getImgArr,
        updateImgArr,
        setImgArr
    }
}
