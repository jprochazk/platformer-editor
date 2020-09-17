


/**
 * Count FPS by averaging a configurable amount of samples
 * 
 * Leads to a less frequently changing FPS number, for legibility.
 */
export class FPSCount {
    private fps;
    private lastTime;
    private sampleIndex;
    private numSamples;
    private fpsCount;
    private samples;
    private framesPerSample;

    constructor(samples: number = 10, framesPerSample: number = 100) {
        this.fps = -1;
        this.lastTime = Date.now();
        this.sampleIndex = 0;
        this.fpsCount = 0;
        this.numSamples = samples;
        this.samples = new Array(this.numSamples).fill(0);
        this.framesPerSample = framesPerSample;
    }

    get(): string {
        return this.fps.toFixed(0);
    }

    update(time: number) {
        if ((this.fpsCount++) % this.framesPerSample === 0) {
            // average the samples
            let diffSum = 0;
            for (let i = 0; i < this.numSamples; ++i) {
                diffSum += this.samples[i];
            }
            const diffAvg = diffSum / this.numSamples;
            // frequency [1/ms] = 1 / period 
            // converted to seconds:
            // frequency [1/s] = 1000 / period 
            this.fps = 1000 / diffAvg;
        }

        // get time difference
        const diff = time - this.lastTime;
        this.lastTime = time;

        // add it to samples
        this.sampleIndex = (this.sampleIndex + 1) % this.numSamples;
        this.samples[this.sampleIndex] = diff;
    }
}