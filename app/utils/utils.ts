export function getLoginErrorMessageFromStatus(errorStatus: number) {
    const errorStatusMessage: Record<number, string> = {
        500: 'Erro desconhecido. Contate o suporte.',
        401: 'Suas credenciais não batem com nenhuma dos nossos servidores. Tente novamente.'
    }

    return errorStatusMessage[errorStatus] || 'Unknown error. Please contact support.'
}