export const getRiotAPIKey = async () => {
    const res = await fetch('/api-keys.json');
    const json = await res.json();
    return json.data[0].value;
}

export const capitalize = ([firstLetter, ...restOfWord]) => firstLetter.toUpperCase() + restOfWord.join("");

export const getKeyByValue = (object, value) => {
    return Object.keys(object).find(key => object[key] === value);
}