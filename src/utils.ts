export function camelToSnakeCase(camel: string): string {
    let snake = camel.charAt(0)
    for (let i = 1; i < camel.length; i++) {
        const char = camel.charAt(i)
        if (char >= 'A' && char <= 'Z') {
            snake += '_'
        }
        snake += char.toLowerCase()
    }
    return snake
}