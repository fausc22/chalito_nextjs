import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API_CONFIG } from '../config/api';

/**
 * Hook para gestionar conexión WebSocket
 * Fase 3: WebSockets para actualización en tiempo real
 */
export const useSocket = (onPedidoCreado, onPedidoEstadoCambiado, onCapacidadActualizada, onPedidosAtrasados, onPedidoActualizado) => {
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Conectar a Socket.IO
        const socket = io(API_CONFIG.BASE_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current = socket;

        // Eventos de conexión
        socket.on('connect', () => {
            console.log('✅ [WebSocket] Conectado:', socket.id);
            setIsConnected(true);
            
            // Suscribirse a eventos
            socket.emit('subscribe:pedidos');
            socket.emit('subscribe:capacidad');
        });

        socket.on('disconnect', () => {
            console.log('🔌 [WebSocket] Desconectado');
            setIsConnected(false);
        });

        socket.on('connect_error', (error) => {
            console.error('❌ [WebSocket] Error de conexión:', error);
            setIsConnected(false);
        });

        // Eventos de negocio
        socket.on('pedido:creado', (data) => {
            console.log('📦 [WebSocket] Pedido creado:', data);
            if (onPedidoCreado) {
                onPedidoCreado(data);
            }
        });

        socket.on('pedido:estado-cambiado', (data) => {
            console.log('🔄 [WebSocket] Estado cambiado:', data);
            if (onPedidoEstadoCambiado) {
                onPedidoEstadoCambiado(data);
            }
        });

        socket.on('capacidad:actualizada', (data) => {
            console.log('📊 [WebSocket] Capacidad actualizada:', data);
            if (onCapacidadActualizada) {
                onCapacidadActualizada(data);
            }
        });

        socket.on('pedidos:atrasados', (data) => {
            console.log('⚠️ [WebSocket] Pedidos atrasados:', data);
            if (onPedidosAtrasados) {
                onPedidosAtrasados(data);
            }
        });

        socket.on('pedido:actualizado', (data) => {
            console.log('🔄 [WebSocket] Pedido actualizado:', data);
            if (onPedidoActualizado) {
                onPedidoActualizado(data);
            }
        });

        // Cleanup
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [onPedidoCreado, onPedidoEstadoCambiado, onCapacidadActualizada, onPedidosAtrasados, onPedidoActualizado]); // Incluir callbacks en dependencias

    return { socket: socketRef.current, isConnected };
};







