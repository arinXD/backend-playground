function getRandomNumber(min: number = 10, max: number = 38): number {
    return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

export {
    getRandomNumber
}