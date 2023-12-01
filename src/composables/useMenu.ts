export function useMenu() {
	const router = useRouter()
	const routes = router.getRoutes()

	const exclusionRouteNames = [
		'deploy',
		'round',
		'factory',
		'user-registry',
		'recipient-registry',
		'contribute',
		'claim',
		'viem-ethers',
	]

	const pages = computed(() => {
		return routes
			.filter(route => !exclusionRouteNames.includes(route.name as string))
			.map(route => {
				return {
					name: capitalizeFirstLetter(route.name as string),
					to: route.path,
				}
			})
	})

	function capitalizeFirstLetter(str: string) {
		return str.charAt(0).toUpperCase() + str.slice(1)
	}

	return {
		pages,
	}
}
