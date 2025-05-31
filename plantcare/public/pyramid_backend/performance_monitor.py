import psycopg2
import time
import logging
from psycopg2 import pool
from typing import Dict, List, Any

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatabasePerformanceMonitor:
    """Monitor database performance and identify bottlenecks"""
    
    def __init__(self, db_config: Dict[str, str]):
        self.db_config = db_config
        self.connection = None
        self.query_stats = []
        
    def connect(self):
        """Connect to database"""
        try:
            self.connection = psycopg2.connect(**self.db_config)
            logger.info("Connected to database for performance monitoring")
        except Exception as e:
            logger.error(f"Failed to connect to database: {e}")
            raise
    
    def disconnect(self):
        """Disconnect from database"""
        if self.connection:
            self.connection.close()
            logger.info("Disconnected from database")
    
    def execute_timed_query(self, query: str, params=None) -> Dict[str, Any]:
        """Execute a query and measure its performance"""
        if not self.connection:
            self.connect()
        
        cursor = self.connection.cursor()
        start_time = time.time()
        
        try:
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            
            results = cursor.fetchall()
            execution_time = time.time() - start_time
            
            # Store query stats
            query_stat = {
                "query": query[:100] + "..." if len(query) > 100 else query,
                "execution_time": execution_time,
                "row_count": len(results),
                "timestamp": time.time()
            }
            self.query_stats.append(query_stat)
            
            # Log slow queries
            if execution_time > 0.5:
                logger.warning(f"Slow query detected: {execution_time:.3f}s - {query[:50]}...")
            
            return {
                "results": results,
                "execution_time": execution_time,
                "row_count": len(results)
            }
            
        except Exception as e:
            logger.error(f"Query execution failed: {e}")
            raise
        finally:
            cursor.close()
    
    def analyze_table_performance(self, table_name: str) -> Dict[str, Any]:
        """Analyze performance of a specific table"""
        analysis = {}
        
        # Table size and row count
        size_query = f"""
        SELECT 
            pg_size_pretty(pg_total_relation_size('{table_name}')) as table_size,
            COUNT(*) as row_count
        FROM {table_name}
        """
        
        size_result = self.execute_timed_query(size_query)
        if size_result["results"]:
            table_size, row_count = size_result["results"][0]
            analysis["table_size"] = table_size
            analysis["row_count"] = row_count
        
        # Index usage statistics
        index_query = f"""
        SELECT 
            indexrelname as index_name,
            idx_tup_read as index_reads,
            idx_tup_fetch as index_fetches
        FROM pg_stat_user_indexes 
        WHERE relname = '{table_name}'
        """
        
        index_result = self.execute_timed_query(index_query)
        analysis["indexes"] = index_result["results"]
        
        # Sequential scan statistics
        seq_scan_query = f"""
        SELECT 
            seq_scan as sequential_scans,
            seq_tup_read as sequential_reads,
            idx_scan as index_scans,
            idx_tup_fetch as index_fetches
        FROM pg_stat_user_tables 
        WHERE relname = '{table_name}'
        """
        
        seq_result = self.execute_timed_query(seq_scan_query)
        if seq_result["results"]:
            analysis["scan_stats"] = {
                "sequential_scans": seq_result["results"][0][0],
                "sequential_reads": seq_result["results"][0][1],
                "index_scans": seq_result["results"][0][2],
                "index_fetches": seq_result["results"][0][3]
            }
        
        return analysis
    
    def test_dashboard_queries(self) -> Dict[str, Any]:
        """Test dashboard query performance"""
        logger.info("Testing dashboard query performance...")
        
        # Original multiple queries approach
        start_time = time.time()
        
        self.execute_timed_query("SELECT COUNT(*) FROM tanaman")
        self.execute_timed_query("SELECT COUNT(*) FROM jadwal")
        self.execute_timed_query("SELECT COUNT(*) FROM jadwal WHERE tanggal = CURRENT_DATE")
        self.execute_timed_query("SELECT id, nama, jenis, lokasi, created_at FROM tanaman ORDER BY created_at DESC LIMIT 5")
        self.execute_timed_query("SELECT id, nama_tanaman, kegiatan, tanggal FROM jadwal WHERE tanggal >= CURRENT_DATE ORDER BY tanggal ASC LIMIT 5")
        self.execute_timed_query("SELECT jenis, COUNT(*) FROM tanaman GROUP BY jenis")
        
        multiple_queries_time = time.time() - start_time
        
        # Optimized single query approach
        optimized_query = """
        WITH 
        tanaman_counts AS (
            SELECT 
                COUNT(*) as total_tanaman,
                COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as recent_count
            FROM tanaman
        ),
        jadwal_counts AS (
            SELECT 
                COUNT(*) as total_jadwal,
                COUNT(*) FILTER (WHERE tanggal = CURRENT_DATE) as total_jadwal_hari_ini,
                COUNT(*) FILTER (WHERE tanggal >= CURRENT_DATE) as upcoming_count
            FROM jadwal
        ),
        recent_plants AS (
            SELECT 
                json_agg(
                    json_build_object(
                        'id', id,
                        'nama', nama, 
                        'jenis', jenis,
                        'lokasi', lokasi,
                        'created_at', created_at::text
                    ) ORDER BY created_at DESC
                ) as plants
            FROM (
                SELECT id, nama, jenis, lokasi, created_at 
                FROM tanaman 
                ORDER BY created_at DESC 
                LIMIT 5
            ) t
        ),
        upcoming_schedules AS (
            SELECT 
                json_agg(
                    json_build_object(
                        'id', id,
                        'namaTanaman', nama_tanaman,
                        'kegiatan', kegiatan,
                        'tanggal', tanggal::text
                    ) ORDER BY tanggal ASC
                ) as schedules
            FROM (
                SELECT id, nama_tanaman, kegiatan, tanggal 
                FROM jadwal 
                WHERE tanggal >= CURRENT_DATE 
                ORDER BY tanggal ASC 
                LIMIT 5
            ) s
        ),
        plant_stats AS (
            SELECT 
                json_agg(
                    json_build_object(
                        'jenis', jenis,
                        'jumlah', count
                    )
                ) as stats
            FROM (
                SELECT jenis, COUNT(*) as count
                FROM tanaman 
                GROUP BY jenis
                ORDER BY count DESC
            ) ps
        )
        SELECT 
            tc.total_tanaman,
            jc.total_jadwal,
            jc.total_jadwal_hari_ini,
            COALESCE(rp.plants, '[]'::json) as recent_plants,
            COALESCE(us.schedules, '[]'::json) as upcoming_schedules,
            COALESCE(ps.stats, '[]'::json) as plant_stats
        FROM tanaman_counts tc
        CROSS JOIN jadwal_counts jc
        CROSS JOIN recent_plants rp
        CROSS JOIN upcoming_schedules us
        CROSS JOIN plant_stats ps;
        """
        
        single_query_result = self.execute_timed_query(optimized_query)
        single_query_time = single_query_result["execution_time"]
        
        improvement = ((multiple_queries_time - single_query_time) / multiple_queries_time) * 100
        
        return {
            "multiple_queries_time": multiple_queries_time,
            "single_query_time": single_query_time,
            "improvement_percentage": improvement,
            "recommendation": "Use optimized single query" if improvement > 0 else "Multiple queries might be better"
        }
    
    def test_search_performance(self) -> Dict[str, Any]:
        """Test search query performance with and without indexes"""
        logger.info("Testing search query performance...")
        
        search_tests = []
        
        # Test different search patterns
        search_queries = [
            ("Exact match", "SELECT * FROM tanaman WHERE nama = 'Mawar'"),
            ("ILIKE search", "SELECT * FROM tanaman WHERE nama ILIKE '%rose%'"),
            ("Multi-column search", "SELECT * FROM tanaman WHERE nama ILIKE '%a%' OR jenis ILIKE '%a%' OR lokasi ILIKE '%a%'"),
            ("Date range search", "SELECT * FROM jadwal WHERE tanggal >= CURRENT_DATE AND tanggal <= CURRENT_DATE + INTERVAL '7 days'"),
        ]
        
        for test_name, query in search_queries:
            result = self.execute_timed_query(query)
            search_tests.append({
                "test_name": test_name,
                "execution_time": result["execution_time"],
                "row_count": result["row_count"]
            })
        
        return {"search_tests": search_tests}
    
    def generate_performance_report(self) -> Dict[str, Any]:
        """Generate comprehensive performance report"""
        logger.info("Generating performance report...")
        
        report = {
            "timestamp": time.time(),
            "database_analysis": {},
            "dashboard_performance": {},
            "search_performance": {},
            "recommendations": []
        }
        
        try:
            # Analyze main tables
            for table in ["tanaman", "jadwal", "users"]:
                report["database_analysis"][table] = self.analyze_table_performance(table)
            
            # Test dashboard performance
            report["dashboard_performance"] = self.test_dashboard_queries()
            
            # Test search performance
            report["search_performance"] = self.test_search_performance()
            
            # Generate recommendations
            report["recommendations"] = self.generate_recommendations(report)
            
        except Exception as e:
            logger.error(f"Error generating performance report: {e}")
            report["error"] = str(e)
        
        return report
    
    def generate_recommendations(self, report: Dict[str, Any]) -> List[str]:
        """Generate performance recommendations based on analysis"""
        recommendations = []
        
        # Database recommendations
        for table, analysis in report["database_analysis"].items():
            if "scan_stats" in analysis:
                seq_scans = analysis["scan_stats"].get("sequential_scans", 0)
                idx_scans = analysis["scan_stats"].get("index_scans", 0)
                
                if seq_scans > idx_scans * 2:
                    recommendations.append(f"Consider adding indexes to {table} table - high sequential scan ratio")
        
        # Dashboard recommendations
        dashboard_perf = report["dashboard_performance"]
        if dashboard_perf.get("improvement_percentage", 0) > 30:
            recommendations.append("Switch to optimized single-query dashboard approach for better performance")
        
        # Search recommendations
        search_tests = report["search_performance"].get("search_tests", [])
        for test in search_tests:
            if test["execution_time"] > 0.1:
                recommendations.append(f"Optimize {test['test_name']} - execution time: {test['execution_time']:.3f}s")
        
        return recommendations

def run_performance_analysis():
    """Run complete performance analysis"""
    db_config = {
        'dbname': 'plantcare_db',
        'user': 'postgres',
        'password': 'jeremiaz',
        'host': 'localhost'
    }
    
    monitor = DatabasePerformanceMonitor(db_config)
    
    try:
        monitor.connect()
        report = monitor.generate_performance_report()
        
        # Print report
        print("\n" + "="*60)
        print("PLANTCARE DATABASE PERFORMANCE REPORT")
        print("="*60)
        
        print(f"\nTimestamp: {time.ctime(report['timestamp'])}")
        
        # Database Analysis
        print("\n📊 DATABASE ANALYSIS:")
        for table, analysis in report["database_analysis"].items():
            print(f"\n  {table.upper()} TABLE:")
            print(f"    - Size: {analysis.get('table_size', 'unknown')}")
            print(f"    - Rows: {analysis.get('row_count', 'unknown')}")
            if "scan_stats" in analysis:
                stats = analysis["scan_stats"]
                print(f"    - Sequential scans: {stats.get('sequential_scans', 0)}")
                print(f"    - Index scans: {stats.get('index_scans', 0)}")
        
        # Dashboard Performance
        print("\n🚀 DASHBOARD PERFORMANCE:")
        dashboard = report["dashboard_performance"]
        print(f"  - Multiple queries: {dashboard.get('multiple_queries_time', 0):.3f}s")
        print(f"  - Single query: {dashboard.get('single_query_time', 0):.3f}s")
        print(f"  - Improvement: {dashboard.get('improvement_percentage', 0):.1f}%")
        
        # Search Performance
        print("\n🔍 SEARCH PERFORMANCE:")
        for test in report["search_performance"].get("search_tests", []):
            print(f"  - {test['test_name']}: {test['execution_time']:.3f}s ({test['row_count']} rows)")
        
        # Recommendations
        print("\n💡 RECOMMENDATIONS:")
        for i, rec in enumerate(report["recommendations"], 1):
            print(f"  {i}. {rec}")
        
        print("\n" + "="*60)
        
        return report
        
    except Exception as e:
        logger.error(f"Performance analysis failed: {e}")
        return {"error": str(e)}
    finally:
        monitor.disconnect()

if __name__ == "__main__":
    run_performance_analysis()
