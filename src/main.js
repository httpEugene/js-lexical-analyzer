(() => {
    document.getElementById('file').onchange = function() {
            const [file] = this.files;
            const reader = new FileReader();

            reader.onload = () => {
                const programChars = Array.from(this.result);
                for(var i = 0; i < programChars.length; i++) {
                    console.log(programChars[i]);
                }
            };
            reader.readAsText(file);
        };
})();
