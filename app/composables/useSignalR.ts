import * as signalR from '@microsoft/signalr'

interface BasicNotification {
  message: string
  // Backend sends numeric enum: 0=Information, 1=Success, 2=Warning, 3=Error
  // Or string: 'Information', 'Success', 'Warning', 'Error'
  label: number | string
}

export const useSignalR = () => {
  const config = useRuntimeConfig()
  const { authToken, tenantId } = useAuthState()
  const notification = useNotification()

  // Connection state
  const connection = useState<signalR.HubConnection | null>('signalr-connection', () => null)
  const isConnected = useState<boolean>('signalr-connected', () => false)
  const connectionError = useState<string | null>('signalr-error', () => null)

  /**
   * Build the SignalR hub URL with tenant header
   */
  const buildHubUrl = () => {
    const baseUrl = config.public.apiBaseUrl || 'https://localhost:5001'
    return `${baseUrl}/notifications`
  }

  /**
   * Start SignalR connection
   */
  const connect = async (): Promise<boolean> => {
    // Don't connect if already connected or no auth token
    if (connection.value?.state === signalR.HubConnectionState.Connected) {
      console.log('[SignalR] Already connected')
      return true
    }

    if (!authToken.value) {
      console.log('[SignalR] No auth token, skipping connection')
      return false
    }

    try {
      // Build new connection
      const hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(buildHubUrl(), {
          accessTokenFactory: () => authToken.value || '',
          headers: tenantId.value ? { 'tenant': tenantId.value } : {},
          withCredentials: false
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000]) // Retry intervals
        .configureLogging(signalR.LogLevel.Information)
        .build()

      // Set up event handlers
      setupEventHandlers(hubConnection)

      // Start connection
      await hubConnection.start()

      connection.value = hubConnection
      isConnected.value = true
      connectionError.value = null

      console.log('[SignalR] Connected successfully')
      return true
    } catch (err: any) {
      console.error('[SignalR] Connection failed:', err)
      connectionError.value = err.message || 'Connection failed'
      isConnected.value = false
      return false
    }
  }

  /**
   * Set up SignalR event handlers
   */
  const setupEventHandlers = (hubConnection: signalR.HubConnection) => {
    // Handle notifications from server
    hubConnection.on('NotificationFromServer', (type: string, payload: any) => {
      console.log('[SignalR] Notification received:', type, payload)

      // Handle BasicNotification
      if (type === 'FSH.WebApi.Shared.Notifications.BasicNotification') {
        handleBasicNotification(payload as BasicNotification)
      }
    })

    // Handle reconnection
    hubConnection.onreconnecting((error) => {
      console.log('[SignalR] Reconnecting...', error)
      isConnected.value = false
    })

    hubConnection.onreconnected((connectionId) => {
      console.log('[SignalR] Reconnected:', connectionId)
      isConnected.value = true
    })

    hubConnection.onclose((error) => {
      console.log('[SignalR] Connection closed:', error)
      isConnected.value = false
      connection.value = null
    })
  }

  /**
   * Handle BasicNotification from server
   * Supports both numeric enum (0-3) and string labels
   */
  const handleBasicNotification = (notif: BasicNotification) => {
    const label = notif.label

    // Handle numeric enum: 0=Information, 1=Success, 2=Warning, 3=Error
    if (typeof label === 'number') {
      switch (label) {
        case 1:
          notification.success(notif.message)
          break
        case 3:
          notification.error(notif.message)
          break
        case 2:
          notification.warning(notif.message)
          break
        case 0:
        default:
          notification.info(notif.message)
          break
      }
    } else {
      // Handle string labels
      switch (label) {
        case 'Success':
          notification.success(notif.message)
          break
        case 'Error':
          notification.error(notif.message)
          break
        case 'Warning':
          notification.warning(notif.message)
          break
        case 'Information':
        default:
          notification.info(notif.message)
          break
      }
    }
  }

  /**
   * Disconnect SignalR
   */
  const disconnect = async (): Promise<void> => {
    if (connection.value) {
      try {
        await connection.value.stop()
        console.log('[SignalR] Disconnected')
      } catch (err) {
        console.error('[SignalR] Disconnect error:', err)
      } finally {
        connection.value = null
        isConnected.value = false
      }
    }
  }

  /**
   * Subscribe to custom events
   */
  const on = (event: string, callback: (...args: any[]) => void) => {
    if (connection.value) {
      connection.value.on(event, callback)
    }
  }

  /**
   * Unsubscribe from custom events
   */
  const off = (event: string, callback: (...args: any[]) => void) => {
    if (connection.value) {
      connection.value.off(event, callback)
    }
  }

  return {
    // State
    isConnected,
    connectionError,

    // Methods
    connect,
    disconnect,
    on,
    off
  }
}
