<h1 class="test">Test {foo}</h1>
{#each new Array(count) as item}
    <h2>sdasdassda {count} as as</h2>
{/each}
<SubElement/>

<script>
import SubElement from '@/pages/subElement'

let foo = 'World'
let count = 0

function increaseCount () {
    count += 1
}

setInterval(increaseCount, 1000)
</script>
<style>
.test {
    background: red;
}
</style>