import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API_CONFIG } from '../config/api';

/**
 * Hook para gestionar conexión WebSocket
 * Fase 3: WebSockets para actualización en tiempo real
 */
export const useSocket = (
    onPedidoCreado,
    onPedidoEstadoCambiado,
    onPedidoCobrado,
    onCapacidadActualizada,
    onPedidosAtrasados,
    onPedidoActualizado,
    onWorkerHeartbeat
) => {
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
            if (onWorkerHeartbeat) {
                onWorkerHeartbeat({ active: true, timestamp: Date.now(), source: 'socket_connect' });
            }
            
            // Suscribirse a eventos
            socket.emit('subscribe:pedidos');
            socket.emit('subscribe:capacidad');
            socket.emit('subscribe:worker-status');
            socket.emit('worker:status:request');
            socket.emit('worker_status:request');
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
            if (onWorkerHeartbeat) {
                onWorkerHeartbeat({ active: true, timestamp: Date.now(), source: 'pedido:creado' });
            }
            if (onPedidoCreado) {
                onPedidoCreado(data);
            }
        });

        socket.on('pedido:estado-cambiado', (data) => {
            console.log('🔄 [WebSocket] Estado cambiado:', data);
            if (onWorkerHeartbeat) {
                onWorkerHeartbeat({ active: true, timestamp: Date.now(), source: 'pedido:estado-cambiado' });
            }
            if (onPedidoEstadoCambiado) {
                onPedidoEstadoCambiado(data);
            }
        });

        socket.on('pedido:cobrado', (data) => {
            console.log('💰 [WebSocket] Pedido cobrado:', data);
            if (onWorkerHeartbeat) {
                onWorkerHeartbeat({ active: true, timestamp: Date.now(), source: 'pedido:cobrado' });
            }
            if (onPedidoCobrado) {
                onPedidoCobrado(data);
            }
        });

        socket.on('capacidad:actualizada', (data) => {
            console.log('📊 [WebSocket] Capacidad actualizada:', data);
            if (onWorkerHeartbeat) {
                onWorkerHeartbeat({ active: true, timestamp: Date.now(), source: 'capacidad:actualizada' });
            }
            if (onCapacidadActualizada) {
                onCapacidadActualizada(data);
            }
        });

        socket.on('pedidos:atrasados', (data) => {
            console.log('⚠️ [WebSocket] Pedidos atrasados:', data);
            if (onWorkerHeartbeat) {
                onWorkerHeartbeat({ active: true, timestamp: Date.now(), source: 'pedidos:atrasados' });
            }
            if (onPedidosAtrasados) {
                onPedidosAtrasados(data);
            }
        });

        socket.on('pedido:actualizado', (data) => {
            console.log('🔄 [WebSocket] Pedido actualizado:', data);
            if (onWorkerHeartbeat) {
                onWorkerHeartbeat({ active: true, timestamp: Date.now(), source: 'pedido:actualizado' });
            }
            if (onPedidoActualizado) {
                onPedidoActualizado(data);
            }
        });

        // Eventos de estado del worker (si existen en backend)
        socket.on('worker_status', (data) => {
            console.log('🫀 [WebSocket] worker_status:', data);
            if (onWorkerHeartbeat) {
                onWorkerHeartbeat(data);
            }
        });

        socket.on('worker_heartbeat', (data) => {
            console.log('🫀 [WebSocket] worker_heartbeat:', data);
            if (onWorkerHeartbeat) {
                onWorkerHeartbeat(data);
            }
        });

        socket.on('worker_connected', (data) => {
            console.log('🫀 [WebSocket] worker_connected:', data);
            if (onWorkerHeartbeat) {
                onWorkerHeartbeat({
                    ...(data || {}),
                    active: typeof data?.active === 'boolean' ? data.active : true,
                    timestamp: data?.timestamp || Date.now()
                });
            }
        });

        socket.on('status_update', (data) => {
            if (data?.target === 'worker' || data?.type === 'worker' || data?.worker != null) {
                console.log('🫀 [WebSocket] status_update(worker):', data);
                if (onWorkerHeartbeat) {
                    onWorkerHeartbeat(data?.worker || data);
                }
            }
        });

        // Cleanup
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [onPedidoCreado, onPedidoEstadoCambiado, onPedidoCobrado, onCapacidadActualizada, onPedidosAtrasados, onPedidoActualizado, onWorkerHeartbeat]); // Incluir callbacks en dependencias

    return { socket: socketRef.current, isConnected };
};







