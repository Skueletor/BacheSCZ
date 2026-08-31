// src/config/admins.ts

/**
 * Lista blanca de correos electrónicos autorizados para tener rol de ADMINISTRADOR.
 * Solo los correos que estén EXACTAMENTE en esta lista recibirán el rol 'ADMIN'.
 * Cualquier otro correo, incluso si contiene la palabra "admin", será tratado como 'USER'.
 */
export const ADMIN_EMAILS = [
    'admin@santacruz.gob.bo',
    'administrador@santacruz.gob.bo',
    'baches@alcaldia.gob.bo',
    // Agrega aquí más correos autorizados de la alcaldía o funcionarios
]

/**
 * Verifica si un correo electrónico está en la lista blanca de administradores.
 * @param email El correo a verificar
 * @returns true si es un admin autorizado, false en caso contrario
 */
export const isAdminEmail = (email: string): boolean => {
    return ADMIN_EMAILS.includes(email.toLowerCase().trim())
}