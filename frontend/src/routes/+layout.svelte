<script>
    import Header from "$lib/headerandfooter/Header.svelte";
    import Footer from "$lib/headerandfooter/Footer.svelte";
    import "$lib/headerandfooter/HeaderAndFooter.css";

    import faviconUrl from "$lib/headerandfooter/favicon.ico?url";
</script>

<svelte:head>
    <link rel="icon" type="image/x-icon" href={faviconUrl} />
</svelte:head>

<div class="layout-wrapper">
    <Header />

    <main>
        <slot />
    </main>

    <Footer />
</div>