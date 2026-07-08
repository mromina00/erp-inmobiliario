/**
 * LoadingButton — botón que se deshabilita y muestra spinner mientras carga.
 *
 * Uso:
 *   <LoadingButton onClick={handleGuardar}>Guardar</LoadingButton>
 *   <LoadingButton type="submit" loading={guardando}>Crear contrato</LoadingButton>
 *
 * Props:
 *   loading    — forzar estado de carga desde afuera (opcional)
 *   onClick    — función async, el botón maneja el loading automáticamente
 *   type       — "button" | "submit" (default: "button")
 *   className  — clases extra
 *   disabled   — deshabilitar manualmente
 *   children   — contenido del botón
 */
 import { useState } from 'react'

 function LoadingButton({
   children,
   onClick,
   type = 'button',
   loading: loadingProp,
   disabled,
   className = '',
   style,
   ...rest
 }) {
   const [loadingInternal, setLoadingInternal] = useState(false)
   const loading = loadingProp !== undefined ? loadingProp : loadingInternal
   const isDisabled = disabled || loading
 
   async function handleClick(e) {
     if (!onClick) return
     setLoadingInternal(true)
     try {
       await onClick(e)
     } finally {
       setLoadingInternal(false)
     }
   }
 
   return (
     <button
       type={type}
       disabled={isDisabled}
       onClick={type === 'button' ? handleClick : undefined}
       className={`${className} ${loading ? 'loading' : ''}`.trim()}
       style={style}
       {...rest}
     >
       {loading ? (
         <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
           <span style={{
             width: '12px',
             height: '12px',
             border: '2px solid currentColor',
             borderTopColor: 'transparent',
             borderRadius: '50%',
             display: 'inline-block',
             animation: 'spin 0.7s linear infinite',
           }} />
           {children}
         </span>
       ) : children}
     </button>
   )
 }
 
 export default LoadingButton