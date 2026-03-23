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
    const handlersRef = useRef({
        onPedidoCreado,
        onPedidoEstadoCambiado,
        onPedidoCobrado,
        onCapacidadActualizada,
        onPedidosAtrasados,
        onPedidoActualizado,
        onWorkerHeartbeat,
    });

    // Mantener referencias actualizadas sin recrear la conexión
    useEffect(() => {
        handlersRef.current = {
            onPedidoCreado,
            onPedidoEstadoCambiado,
            onPedidoCobrado,
            onCapacidadActualizada,
            onPedidosAtrasados,
            onPedidoActualizado,
            onWorkerHeartbeat,
        };
    }, [
        onPedidoCreado,
        onPedidoEstadoCambiado,
        onPedidoCobrado,
        onCapacidadActualizada,
        onPedidosAtrasados,
        onPedidoActualizado,
        onWorkerHeartbeat
    ]);

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
            if (handlersRef.current.onWorkerHeartbeat) {
                handlersRef.current.onWorkerHeartbeat({ active: true, timestamp: Date.now(), source: 'socket_connect' });
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
            if (handlersRef.current.onWorkerHeartbeat) {
                handlersRef.current.onWorkerHeartbeat({ active: true, timestamp: Date.now(), source: 'pedido:creado' });
            }
            if (handlersRef.current.onPedidoCreado) {
                handlersRef.current.onPedidoCreado(data);
            }
        });

        socket.on('pedido:estado-cambiado', (data) => {
            console.log('🔄 [WebSocket] Estado cambiado:', data);
            if (handlersRef.current.onWorkerHeartbeat) {
                handlersRef.current.onWorkerHeartbeat({ active: true, timestamp: Date.now(), source: 'pedido:estado-cambiado' });
            }
            if (handlersRef.current.onPedidoEstadoCambiado) {
                handlersRef.current.onPedidoEstadoCambiado(data);
            }
        });

        socket.on('pedido:cobrado', (data) => {
            console.log('💰 [WebSocket] Pedido cobrado:', data);
            if (handlersRef.current.onWorkerHeartbeat) {
                handlersRef.current.onWorkerHeartbeat({ active: true, timestamp: Date.now(), source: 'pedido:cobrado' });
            }
            if (handlersRef.current.onPedidoCobrado) {
                handlersRef.current.onPedidoCobrado(data);
            }
        });

        socket.on('capacidad:actualizada', (data) => {
            console.log('📊 [WebSocket] Capacidad actualizada:', data);
            if (handlersRef.current.onWorkerHeartbeat) {
                handlersRef.current.onWorkerHeartbeat({ active: true, timestamp: Date.now(), source: 'capacidad:actualizada' });
            }
            if (handlersRef.current.onCapacidadActualizada) {
                handlersRef.current.onCapacidadActualizada(data);
            }
        });

        socket.on('pedidos:atrasados', (data) => {
            console.log('⚠️ [WebSocket] Pedidos atrasados:', data);
            if (handlersRef.current.onWorkerHeartbeat) {
                handlersRef.current.onWorkerHeartbeat({ active: true, timestamp: Date.now(), source: 'pedidos:atrasados' });
            }
            if (handlersRef.current.onPedidosAtrasados) {
                handlersRef.current.onPedidosAtrasados(data);
            }
        });

        socket.on('pedido:actualizado', (data) => {
            console.log('🔄 [WebSocket] Pedido actualizado:', data);
            if (handlersRef.current.onWorkerHeartbeat) {
                handlersRef.current.onWorkerHeartbeat({ active: true, timestamp: Date.now(), source: 'pedido:actualizado' });
            }
            if (handlersRef.current.onPedidoActualizado) {
                handlersRef.current.onPedidoActualizado(data);
            }
        });

        // Eventos de estado del worker (si existen en backend)
        socket.on('worker_status', (data) => {
            console.log('🫀 [WebSocket] worker_status:', data);
            if (handlersRef.current.onWorkerHeartbeat) {
                handlersRef.current.onWorkerHeartbeat(data);
            }
        });

        socket.on('worker_heartbeat', (data) => {
            console.log('🫀 [WebSocket] worker_heartbeat:', data);
            if (handlersRef.current.onWorkerHeartbeat) {
                handlersRef.current.onWorkerHeartbeat(data);
            }
        });

        socket.on('worker_connected', (data) => {
            console.log('🫀 [WebSocket] worker_connected:', data);
            if (handlersRef.current.onWorkerHeartbeat) {
                handlersRef.current.onWorkerHeartbeat({
                    ...(data || {}),
                    active: typeof data?.active === 'boolean' ? data.active : true,
                    timestamp: data?.timestamp || Date.now()
                });
            }
        });

        socket.on('status_update', (data) => {
            if (data?.target === 'worker' || data?.type === 'worker' || data?.worker != null) {
                console.log('🫀 [WebSocket] status_update(worker):', data);
                if (handlersRef.current.onWorkerHeartbeat) {
                    handlersRef.current.onWorkerHeartbeat(data?.worker || data);
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
    }, []); // Conectar solo una vez por mount del hook

    return { socket: socketRef.current, isConnected };
};







