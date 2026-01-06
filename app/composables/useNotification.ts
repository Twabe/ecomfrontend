type NotificationType = 'success' | 'error' | 'warning' | 'info'

// Global timeout ID to prevent race conditions
let hideTimeoutId: ReturnType<typeof setTimeout> | null = null

export const useNotification = () => {
  /**
   * Show notification toast
   */
  const show = (message: string, type: NotificationType = 'info') => {
    // Get or create the notification state
    const notificationState = useState('notification', () => ({
      message: '',
      type: 'info' as NotificationType,
      show: false
    }))

    // Clear any existing timeout to prevent race conditions
    if (hideTimeoutId) {
      clearTimeout(hideTimeoutId)
      hideTimeoutId = null
    }

    // Update state to show notification
    notificationState.value = {
      message,
      type,
      show: true
    }

    // Auto-hide after 5 seconds
    hideTimeoutId = setTimeout(() => {
      notificationState.value.show = false
      hideTimeoutId = null
    }, 5000)
  }

  const success = (message: string) => show(message, 'success')
  const error = (message: string) => show(message, 'error')
  const warning = (message: string) => show(message, 'warning')
  const info = (message: string) => show(message, 'info')

  /**
   * Generic notify function that accepts an object with type and message
   */
  const notify = (options: { type: NotificationType; message: string }) => {
    show(options.message, options.type)
  }

  return {
    show,
    success,
    error,
    warning,
    info,
    notify
  }
}
